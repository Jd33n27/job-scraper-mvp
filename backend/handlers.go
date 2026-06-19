package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/lib/pq"
)

type Handler struct {
	DB            *sql.DB
	Config        *Config
	lastApplyTime time.Time
	applyMu       sync.Mutex
}

func (h *Handler) GetJobs(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, title, company, location, url, description, source, hash, created_at, supports_auto_apply, COALESCE(ai_score, 0), COALESCE(ai_reasoning, ''), salary_min, salary_max,
		(SELECT id FROM applications WHERE job_id = jobs.id ORDER BY applied_at DESC LIMIT 1) as application_id
		FROM jobs
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Fetch CV profile once
	var profile CVProfile
	var skills, locations, titles []string
	pErr := h.DB.QueryRow(`
		SELECT id, raw_text, parsed_skills, experience_level, years_exp, preferred_locations, preferred_job_titles
		FROM cv_profiles LIMIT 1
	`).Scan(&profile.ID, &profile.RawText, pq.Array(&skills), &profile.ExperienceLevel, &profile.YearsExp, pq.Array(&locations), pq.Array(&titles))

	if pErr != nil {
		profile = CVProfile{
			ParsedSkills:       []string{"React", "TypeScript", "JavaScript", "Go", "HTML", "CSS", "Next.js", "Tailwind CSS", "Bootstrap", "Figma"},
			ExperienceLevel:    "Junior",
			YearsExp:           2,
			PreferredLocations: []string{"Remote", "Lagos"},
			PreferredJobTitles: []string{"Frontend Developer", "React Developer", "Software Engineer"},
		}
	} else {
		profile.ParsedSkills = skills
		profile.PreferredLocations = locations
		profile.PreferredJobTitles = titles
	}

	var jobs []Job
	for rows.Next() {
		var j Job
		err := rows.Scan(&j.ID, &j.Title, &j.Company, &j.Location, &j.URL, &j.Description, &j.Source, &j.Hash, &j.CreatedAt, &j.SupportsAutoApply, &j.AIScore, &j.AIReasoning, &j.SalaryMin, &j.SalaryMax, &j.ApplicationID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		match := h.CalculateMatch(j, profile)
		j.Match = &match
		jobs = append(jobs, j)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobs)
}

func (h *Handler) FilterJobs(w http.ResponseWriter, r *http.Request) {
	keyword := r.URL.Query().Get("keyword")
	location := r.URL.Query().Get("location")
	supportsAutoApply := r.URL.Query().Get("supportsAutoApply")
	minSalary := r.URL.Query().Get("minSalary")

	query := `
		SELECT id, title, company, location, url, description, source, hash, created_at, supports_auto_apply, COALESCE(ai_score, 0), COALESCE(ai_reasoning, ''), salary_min, salary_max,
		(SELECT id FROM applications WHERE job_id = jobs.id ORDER BY applied_at DESC LIMIT 1) as application_id
		FROM jobs
		WHERE 1=1
	`
	var args []interface{}
	argCount := 1

	if keyword != "" {
		query += fmt.Sprintf(" AND (title ILIKE $%d OR description ILIKE $%d)", argCount, argCount)
		args = append(args, "%"+keyword+"%")
		argCount++
	}

	if location != "" {
		query += fmt.Sprintf(" AND location ILIKE $%d", argCount)
		args = append(args, "%"+location+"%")
		argCount++
	}

	if supportsAutoApply == "true" {
		query += " AND supports_auto_apply = TRUE"
	}

	if minSalary != "" && minSalary != "0" {
		// minSalary is in 'k', so multiply by 1000
		query += fmt.Sprintf(" AND (salary_min >= $%d OR salary_max >= $%d)", argCount, argCount)
		args = append(args, minSalary+"000") // simple way to add 3 zeros
		argCount++
	}

	query += " ORDER BY created_at DESC"

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Fetch CV profile once
	var profile CVProfile
	var skills, locations, titles []string
	pErr := h.DB.QueryRow(`
		SELECT id, raw_text, parsed_skills, experience_level, years_exp, preferred_locations, preferred_job_titles
		FROM cv_profiles LIMIT 1
	`).Scan(&profile.ID, &profile.RawText, pq.Array(&skills), &profile.ExperienceLevel, &profile.YearsExp, pq.Array(&locations), pq.Array(&titles))

	if pErr != nil {
		profile = CVProfile{
			ParsedSkills:       []string{"React", "TypeScript", "JavaScript", "Go", "HTML", "CSS", "Next.js", "Tailwind CSS", "Bootstrap", "Figma"},
			ExperienceLevel:    "Junior",
			YearsExp:           2,
			PreferredLocations: []string{"Remote", "Lagos"},
			PreferredJobTitles: []string{"Frontend Developer", "React Developer", "Software Engineer"},
		}
	} else {
		profile.ParsedSkills = skills
		profile.PreferredLocations = locations
		profile.PreferredJobTitles = titles
	}

	var jobs []Job
	for rows.Next() {
		var j Job
		err := rows.Scan(&j.ID, &j.Title, &j.Company, &j.Location, &j.URL, &j.Description, &j.Source, &j.Hash, &j.CreatedAt, &j.SupportsAutoApply, &j.AIScore, &j.AIReasoning, &j.SalaryMin, &j.SalaryMax, &j.ApplicationID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		match := h.CalculateMatch(j, profile)
		j.Match = &match
		jobs = append(jobs, j)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobs)
}

// ScrapeJobs triggers the scraper microservice
func (h *Handler) ScrapeJobs(w http.ResponseWriter, r *http.Request) {
	go h.RunScraper()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(`{"message": "Scraping triggered"}`))
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	var u UserData
	err := h.DB.QueryRow("SELECT name, email, phone, COALESCE(skills, ''), COALESCE(bio, '') FROM profile WHERE id = 1").Scan(&u.Name, &u.Email, &u.Phone, &u.Skills, &u.Bio)
	if err != nil {
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var u UserData
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec("UPDATE profile SET name = $1, email = $2, phone = $3, skills = $4, bio = $5, updated_at = NOW() WHERE id = 1",
		u.Name, u.Email, u.Phone, u.Skills, u.Bio)
	if err != nil {
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetUserSettings(w http.ResponseWriter, r *http.Request) {
	var s UserSettings
	var locations, keywords []string
	err := h.DB.QueryRow("SELECT COALESCE(target_locations, '{}'), COALESCE(min_salary, 0), COALESCE(keywords, '{}') FROM user_settings WHERE id = 1").
		Scan(pq.Array(&locations), &s.MinSalary, pq.Array(&keywords))

	if err == sql.ErrNoRows {
		// Return defaults if not found
		s.TargetLocations = []string{}
		s.Keywords = []string{}
	} else if err != nil {
		http.Error(w, "Error fetching settings: "+err.Error(), http.StatusInternalServerError)
		return
	} else {
		s.TargetLocations = locations
		s.Keywords = keywords
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func (h *Handler) UpdateUserSettings(w http.ResponseWriter, r *http.Request) {
	var s UserSettings
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Use lib/pq compatible array syntax
	_, err := h.DB.Exec(`
		INSERT INTO user_settings (id, target_locations, min_salary, keywords, updated_at)
		VALUES (1, $1, $2, $3, NOW())
		ON CONFLICT (id) DO UPDATE SET
			target_locations = $1,
			min_salary = $2,
			keywords = $3,
			updated_at = NOW()`,
		pq.Array(s.TargetLocations), s.MinSalary, pq.Array(s.Keywords))

	if err != nil {
		http.Error(w, "Failed to update settings: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetApplicationPreview(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "jobId")
	var j Job
	err := h.DB.QueryRow("SELECT id, title, company, description FROM jobs WHERE id = $1", jobID).
		Scan(&j.ID, &j.Title, &j.Company, &j.Description)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	// Fetch actual profile from DB
	var u UserData
	h.DB.QueryRow("SELECT name, email, phone, COALESCE(skills, ''), COALESCE(bio, '') FROM profile WHERE id = 1").Scan(&u.Name, &u.Email, &u.Phone, &u.Skills, &u.Bio)

	// Mocking requirement extraction for now
	requirements := []string{
		"Experience with similar roles",
		"Knowledge of industry tools",
		"Ability to work in " + j.Location,
	}

	preview := ApplicationPreview{
		JobID:        j.ID,
		Title:        j.Title,
		Company:      j.Company,
		Requirements: requirements,
		UserData:     u,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(preview)
}

func (h *Handler) GetApplications(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT a.id, a.job_id, a.status, a.method, a.applied_at, j.title, j.company
		FROM applications a
		JOIN jobs j ON a.job_id = j.id
		ORDER BY a.applied_at DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var apps []Application
	for rows.Next() {
		var a Application
		var method sql.NullString
		err := rows.Scan(&a.ID, &a.JobID, &a.Status, &method, &a.AppliedAt, &a.JobTitle, &a.JobCompany)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		a.Method = method.String
		apps = append(apps, a)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apps)
}

func (h *Handler) ResolveApplication(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "appId")
	_, err := h.DB.Exec("UPDATE applications SET status = 'applied_auto', method = 'manual' WHERE id = $1", appID)
	if err != nil {
		http.Error(w, "Failed to resolve application", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Application resolved"}`))
}

func (h *Handler) GetApplicationTraceback(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "appId")
	var a Application
	var method sql.NullString
	var dataBytes []byte

	err := h.DB.QueryRow(`
		SELECT a.id, a.job_id, a.status, a.method, a.submitted_data, a.applied_at, j.title, j.company, j.url
		FROM applications a
		JOIN jobs j ON a.job_id = j.id
		WHERE a.id = $1`, appID).
		Scan(&a.ID, &a.JobID, &a.Status, &method, &dataBytes, &a.AppliedAt, &a.JobTitle, &a.JobCompany, &a.JobURL)

	if err != nil {
		http.Error(w, "Application not found", http.StatusNotFound)
		return
	}

	a.Method = method.String
	if len(dataBytes) > 0 {
		json.Unmarshal(dataBytes, &a.SubmittedData)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a)
}

func (h *Handler) ProxyJobPage(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		http.Error(w, "URL parameter is required", http.StatusBadRequest)
		return
	}

	// Fetch page
	client := http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(targetURL)
	if err != nil {
		http.Error(w, "Failed to fetch page: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Forward content type
	contentType := resp.Header.Get("Content-Type")
	if contentType != "" {
		w.Header().Set("Content-Type", contentType)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	htmlContent := string(body)

	// Inject HTML base tag so relative stylesheet/script/image links resolve from the original host
	baseTag := fmt.Sprintf(`<base href="%s">`, targetURL)
	if strings.Contains(htmlContent, "<head>") {
		htmlContent = strings.Replace(htmlContent, "<head>", "<head>"+baseTag, 1)
	} else {
		htmlContent = baseTag + htmlContent
	}

	// Strip out any framing headers that might confuse the browser inside our iframe
	w.Header().Del("X-Frame-Options")
	w.Header().Del("Content-Security-Policy")

	w.Write([]byte(htmlContent))
}
