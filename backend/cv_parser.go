package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/lib/pq"
)

func (h *Handler) UploadCV(w http.ResponseWriter, r *http.Request) {
	// For Phase 5, we support both reading cv.txt from root and file upload.
	// Let's try to read from cv.txt if no file is uploaded, or handle upload if present.
	var rawText string
	file, _, err := r.FormFile("cv")
	if err != nil {
		// Fallback to cv.txt in root
		content, err := os.ReadFile("cv.txt")
		if err != nil {
			http.Error(w, "cv.txt not found and no file uploaded", http.StatusBadRequest)
			return
		}
		rawText = string(content)
	} else {
		defer file.Close()
		buf := new(bytes.Buffer)
		io.Copy(buf, file)
		rawText = buf.String()
	}

	if rawText == "" {
		http.Error(w, "CV content is empty", http.StatusBadRequest)
		return
	}

	// 1. Call Gemini to parse CV
	parsedCV, err := h.ParseCVWithAI(rawText)
	if err != nil {
		http.Error(w, "AI CV Parsing failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. Store in database
	_, err = h.DB.Exec(`
		INSERT INTO cv_profiles (raw_text, parsed_skills, experience_level, years_exp, preferred_locations, preferred_job_titles, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		ON CONFLICT DO NOTHING`, // Simplification for single user
		rawText, pq.Array(parsedCV.ParsedSkills), parsedCV.ExperienceLevel, parsedCV.YearsExp, pq.Array(parsedCV.PreferredLocations), pq.Array(parsedCV.PreferredJobTitles))

	if err != nil {
		// If ID 1 exists, update it
		_, err = h.DB.Exec(`
			UPDATE cv_profiles SET
				raw_text = $1,
				parsed_skills = $2,
				experience_level = $3,
				years_exp = $4,
				preferred_locations = $5,
				preferred_job_titles = $6,
				updated_at = NOW()
			WHERE id = (SELECT id FROM cv_profiles LIMIT 1)`,
			rawText, pq.Array(parsedCV.ParsedSkills), parsedCV.ExperienceLevel, parsedCV.YearsExp, pq.Array(parsedCV.PreferredLocations), pq.Array(parsedCV.PreferredJobTitles))
	}

	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(parsedCV)
}

func (h *Handler) ParseCVWithAI(text string) (*CVProfile, error) {
	prompt := fmt.Sprintf(`
Analyze the following CV text and extract key information in JSON format.
CV Text:
%s

Expected JSON structure:
{
  "parsed_skills": ["skill1", "skill2"],
  "experience_level": "Junior/Mid/Senior",
  "years_exp": 5,
  "preferred_locations": ["Remote", "Lagos"],
  "preferred_job_titles": ["Frontend Developer", "React Developer"]
}
`, text)

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
		h.LogError("Gemini-CV", err.Error(), "")
		return nil, err
	}
	defer resp.Body.Close()

	h.LogGeminiUsage("CV-Parser")

	body, _ := io.ReadAll(resp.Body)
	var geminiResp GeminiResponse
	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return nil, err
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("AI failed to return content")
	}

	rawJSON := geminiResp.Candidates[0].Content.Parts[0].Text
	// Clean up markdown code blocks if present
	if len(rawJSON) > 7 && rawJSON[:7] == "```json" {
		rawJSON = rawJSON[7 : len(rawJSON)-3]
	} else if len(rawJSON) > 3 && rawJSON[:3] == "```" {
		rawJSON = rawJSON[3 : len(rawJSON)-3]
	}

	var profile CVProfile
	if err := json.Unmarshal([]byte(rawJSON), &profile); err != nil {
		return nil, fmt.Errorf("failed to parse AI JSON: %v, raw: %s", err, rawJSON)
	}

	return &profile, nil
}

func (h *Handler) GetCVProfile(w http.ResponseWriter, r *http.Request) {
	var p CVProfile
	var skills, locations, titles []string
	err := h.DB.QueryRow(`
		SELECT id, raw_text, parsed_skills, experience_level, years_exp, preferred_locations, preferred_job_titles, created_at, updated_at
		FROM cv_profiles LIMIT 1
	`).Scan(&p.ID, &p.RawText, pq.Array(&skills), &p.ExperienceLevel, &p.YearsExp, pq.Array(&locations), pq.Array(&titles), &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "CV Profile not found. Please upload a CV first."})
		return
	}
	p.ParsedSkills = skills
	p.PreferredLocations = locations
	p.PreferredJobTitles = titles

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func (h *Handler) UpdateCVProfile(w http.ResponseWriter, r *http.Request) {
	var p CVProfile
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec(`
		UPDATE cv_profiles SET
			parsed_skills = $1,
			experience_level = $2,
			years_exp = $3,
			preferred_locations = $4,
			preferred_job_titles = $5,
			updated_at = NOW()
		WHERE id = $6`,
		pq.Array(p.ParsedSkills), p.ExperienceLevel, p.YearsExp, pq.Array(p.PreferredLocations), pq.Array(p.PreferredJobTitles), p.ID)

	if err != nil {
		http.Error(w, "Failed to update CV profile", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) SeedCVProfile() {
	var count int
	h.DB.QueryRow("SELECT COUNT(*) FROM cv_profiles").Scan(&count)
	if count > 0 {
		return
	}

	// Try parent directory then current directory
	content, err := os.ReadFile("../cv.txt")
	if err != nil {
		content, err = os.ReadFile("cv.txt")
	}

	if err != nil {
		log.Printf("CV Seed: cv.txt not found in root or backend folder, skipping auto-seed.")
		return
	}

	log.Println("CV Seed: Parsing cv.txt for initial profile...")
	parsed, err := h.ParseCVWithAI(string(content))
	if err != nil {
		log.Printf("CV Seed: AI parsing failed: %v. Using manual defaults.", err)
		// Manual fallback if AI fails
		parsed = &CVProfile{
			ParsedSkills:       []string{"React", "TypeScript", "JavaScript", "Go", "HTML", "CSS", "Next.js", "Tailwind CSS"},
			ExperienceLevel:    "Junior",
			YearsExp:           2,
			PreferredLocations: []string{"Remote", "Lagos"},
			PreferredJobTitles: []string{"Frontend Developer", "React Developer", "Software Engineer"},
		}
	}

	_, err = h.DB.Exec(`
		INSERT INTO cv_profiles (raw_text, parsed_skills, experience_level, years_exp, preferred_locations, preferred_job_titles)
		VALUES ($1, $2, $3, $4, $5, $6)`,
		string(content), pq.Array(parsed.ParsedSkills), parsed.ExperienceLevel, parsed.YearsExp, pq.Array(parsed.PreferredLocations), pq.Array(parsed.PreferredJobTitles))

	if err != nil {
		log.Printf("CV Seed: Failed to store seeded profile: %v", err)
	} else {
		log.Println("CV Seed: Successfully initialized profile from cv.txt")
	}
}
