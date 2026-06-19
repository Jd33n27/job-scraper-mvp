package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// GenerateCoverLetter handles the API request to create a personalized cover letter
func (h *Handler) GenerateCoverLetter(w http.ResponseWriter, r *http.Request) {
	// 1. Get Job and User data
	var input struct {
		JobID int `json:"job_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	var job Job
	err := h.DB.QueryRow("SELECT title, company, description FROM jobs WHERE id = $1", input.JobID).
		Scan(&job.Title, &job.Company, &job.Description)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	var user UserData
	err = h.DB.QueryRow("SELECT name, email, skills, bio FROM profile WHERE id = 1").
		Scan(&user.Name, &user.Email, &user.Skills, &user.Bio)
	if err != nil {
		http.Error(w, "Profile not found", http.StatusInternalServerError)
		return
	}

	// 2. Call Gemini
	prompt := fmt.Sprintf(`
Write a professional, concise cover letter for the following job:
Job Title: %s
Company: %s
Job Description: %s

Applicant Info:
Name: %s
Skills: %s
Background: %s

Guidelines:
- Keep it under 250 words.
- Highlight how the applicant's skills (React, Go, etc.) specifically help with the job requirements.
- Sound enthusiastic but professional.
- Use a standard cover letter format (Date, Greeting, 3 Paragraphs, Closing).
`, job.Title, job.Company, job.Description, user.Name, user.Skills, user.Bio)

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
		h.LogError("Gemini-CoverLetter", err.Error(), "")
		http.Error(w, "AI service error", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	h.LogGeminiUsage("Cover-Letter")

	body, _ := io.ReadAll(resp.Body)
	var geminiResp GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		http.Error(w, "Error parsing AI response", http.StatusInternalServerError)
		return
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		http.Error(w, "AI failed to generate content", http.StatusInternalServerError)
		return
	}

	coverLetter := geminiResp.Candidates[0].Content.Parts[0].Text

	// 3. Save to database if an application exists for this job
	_, _ = h.DB.Exec("UPDATE applications SET cover_letter = $1 WHERE job_id = $2", coverLetter, input.JobID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"cover_letter": coverLetter,
	})
}
