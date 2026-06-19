package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

type GeminiRequest struct {
	Contents []GeminiContent `json:"contents"`
}

type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

type AIAnalysis struct {
	Score     int    `json:"score"`
	Reasoning string `json:"reasoning"`
}

type BatchAIAnalysis struct {
	Results []AIAnalysis `json:"results"`
}

func (h *Handler) AnalyzeJobBatch(jobs []Job, user UserData) []AIAnalysis {
	if h.Config.GeminiAPIKey == "" {
		return nil
	}

	if len(jobs) == 0 {
		return nil
	}

	var jobsText string
	for i, job := range jobs {
		jobsText += fmt.Sprintf("Job %d:\n- Title: %s\n- Company: %s\n- Description: %s\n\n", i, job.Title, job.Company, job.Description)
	}

	prompt := fmt.Sprintf(`
Analyze the following %d job postings against the user's profile.
BE EXTREMELY STRICT. The user is a Junior/Entry-level developer.

Mandatory Criteria:
- Must be an Entry-level, Junior, or Internship role.
- Must involve at least one of: React, TypeScript, Go (Golang).
- Discard (score < 40) any jobs requiring 3+ years of experience, "Senior", "Lead", "Staff", or "Principal" titles.
- Discard any non-technical or unrelated roles.

User Profile:
- Skills: %s
- Bio: %s

Job Postings:
%s

Respond ONLY in JSON format as a list of results:
{"results": [
  {"score": 85, "reasoning": "Matches your strong experience in React."},
  {"score": 40, "reasoning": "Requires 10 years of C++ which you lack."}
]}
`, len(jobs), user.Skills, user.Bio, jobsText)

	reqBody := GeminiRequest{
		Contents: []GeminiContent{
			{
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(reqBody)
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=%s", h.Config.GeminiAPIKey)

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		h.LogError("Gemini-Batch", err.Error(), "")
		return nil
	}
	defer resp.Body.Close()

	h.LogGeminiUsage("/v1beta/models/gemini-2.0-flash:generateContent")

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		h.LogError("Gemini-Batch", fmt.Sprintf("Status %d: %s", resp.StatusCode, string(body)), "")
		return nil
	}

	var geminiResp GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		log.Printf("Error decoding Gemini response: %v", err)
		return nil
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil
	}

	responseText := geminiResp.Candidates[0].Content.Parts[0].Text

	// Clean response text
	responseText = strings.TrimSpace(responseText)
	if strings.HasPrefix(responseText, "```json") {
		responseText = strings.TrimPrefix(responseText, "```json")
		responseText = strings.TrimSuffix(responseText, "```")
	} else if strings.HasPrefix(responseText, "```") {
		responseText = strings.TrimPrefix(responseText, "```")
		responseText = strings.TrimSuffix(responseText, "```")
	}
	responseText = strings.TrimSpace(responseText)

	var batchAnalysis BatchAIAnalysis
	if err := json.Unmarshal([]byte(responseText), &batchAnalysis); err != nil {
		log.Printf("Error parsing AI analysis JSON: %v. Raw text: %s", err, responseText)
		return nil
	}

	return batchAnalysis.Results
}
