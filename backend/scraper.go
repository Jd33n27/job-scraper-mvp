package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/lib/pq"
)

func (h *Handler) DetectAutoApplySupport(url string) bool {
	// 1. Check for known "Auto-Apply Friendly" ATS providers
	friendlyATS := []string{"greenhouse.io", "lever.co", "workable.com", "ashbyhq.com"}
	for _, ats := range friendlyATS {
		if strings.Contains(url, ats) {
			return true
		}
	}

	// 2. Fetch page content with a timeout
	client := http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := client.Get(url)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	// 3. Heuristic: Look for specific input types or names that indicate a simple form
	body, err := io.ReadAll(io.LimitReader(resp.Body, 100*1024)) // Read first 100KB only
	if err != nil {
		return false
	}

	html := strings.ToLower(string(body))

	// Must have a form
	if !strings.Contains(html, "<form") {
		return false
	}

	// Should have specific application-related keywords in close proximity to form fields
	indicators := []string{
		`type="email"`,
		`name="email"`,
		`name="full_name"`,
		`name="fullname"`,
		`placeholder="name"`,
		`type="file"`, // Resume upload
	}

	matches := 0
	for _, ind := range indicators {
		if strings.Contains(html, ind) {
			matches++
		}
	}

	// If it has at least 2 indicators (e.g., email + name or email + resume), it's likely auto-fillable
	return matches >= 2
}

func (h *Handler) RunScraper() {
	log.Println("Starting optimized scraper orchestration...")

	// 0. Fetch profile and settings for filtering and AI matching
	var userData UserData
	err := h.DB.QueryRow("SELECT name, email, phone, COALESCE(skills, ''), COALESCE(bio, '') FROM profile WHERE id = 1").
		Scan(&userData.Name, &userData.Email, &userData.Phone, &userData.Skills, &userData.Bio)
	hasProfile := err == nil

	var settings UserSettings
	var locations, keywords []string
	h.DB.QueryRow("SELECT COALESCE(target_locations, '{}'), COALESCE(min_salary, 0), COALESCE(keywords, '{}') FROM user_settings WHERE id = 1").
		Scan(pq.Array(&locations), &settings.MinSalary, pq.Array(&keywords))
	settings.TargetLocations = locations
	settings.Keywords = keywords

	// 1. Call Node.js scraper service
	reqPayload, _ := json.Marshal(map[string]interface{}{
		"keywords": settings.Keywords,
	})
	resp, err := http.Post(h.Config.ScraperServiceURL+"/scrape", "application/json", bytes.NewBuffer(reqPayload))
	if err != nil {
		h.LogError("Scraper-Service", "Failed to reach scraper microservice: "+err.Error(), "")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		h.LogError("Scraper-Service", fmt.Sprintf("Scraper service returned status %d: %s", resp.StatusCode, string(body)), "")
		return
	}

	var scrapedJobs []Job
	if err := json.NewDecoder(resp.Body).Decode(&scrapedJobs); err != nil {
		h.LogError("Scraper-Service", "Failed to decode response: "+err.Error(), "")
		return
	}

	totalFound := len(scrapedJobs)
	log.Printf("Received %d raw jobs from scraper service", totalFound)

	// 2. Local Advanced Filtering (Step 2 of Phase 4)
	filteredJobs := h.PreFilterJobs(scrapedJobs, userData, settings)
	log.Printf("Filtered down to %d relevant jobs after local keyword/location check.", len(filteredJobs))

	var newJobsToProcess []Job
	for _, job := range filteredJobs {
		job.Hash = GenerateHash(job.Title, job.URL)
		var existingID int
		err := h.DB.QueryRow("SELECT id FROM jobs WHERE hash = $1", job.Hash).Scan(&existingID)
		if err == sql.ErrNoRows {
			newJobsToProcess = append(newJobsToProcess, job)
		}
	}

	log.Printf("Found %d truly new jobs to analyze.", len(newJobsToProcess))

	newJobsCount := 0
	appliedCount := 0
	aiExhausted := false

	// 3. AI Analysis with Mega-Batching
	batchSize := 30
	for i := 0; i < len(newJobsToProcess); i += batchSize {
		end := i + batchSize
		if end > len(newJobsToProcess) {
			end = len(newJobsToProcess)
		}
		batch := newJobsToProcess[i:end]

		var analyses []AIAnalysis
		if hasProfile && h.Config.GeminiAPIKey != "" && !aiExhausted {
			log.Printf("AI Batch Analysis: Processing %d jobs in one request...", len(batch))
			analyses = h.AnalyzeJobBatch(batch, userData)
			if analyses == nil {
				log.Println("AI Analysis failed or exhausted. Saving remaining jobs without AI.")
				aiExhausted = true
			}
			// Rate limit protection
			time.Sleep(5 * time.Second)
		}

		// 4. Processing results
		for j := range batch {
			job := &batch[j]
			if len(analyses) > j {
				job.AIScore = analyses[j].Score
				job.AIReasoning = analyses[j].Reasoning
			}
			job.SupportsAutoApply = h.DetectAutoApplySupport(job.URL)
		}

		// 5. Batch Insert into Database (Optimization)
		h.BatchInsertJobs(batch)
		newJobsCount += len(batch)

		// 6. Handle Smart Matching and Auto-Apply
		if hasProfile {
			var cv CVProfile
			var skills []string
			err := h.DB.QueryRow(`SELECT id, parsed_skills, experience_level, years_exp FROM cv_profiles LIMIT 1`).
				Scan(&cv.ID, pq.Array(&skills), &cv.ExperienceLevel, &cv.YearsExp)
			if err == nil {
				cv.ParsedSkills = skills
				for _, job := range batch {
					match := h.CalculateMatch(job, cv)
					// Store match log
					_, _ = h.DB.Exec(`INSERT INTO match_log (job_id, cv_profile_id, score, details) VALUES ((SELECT id FROM jobs WHERE hash = $1), $2, $3, $4)`,
						job.Hash, cv.ID, match.Score, match.Details)

					if job.SupportsAutoApply && match.Score >= 60 && job.AIScore >= 75 {
						appliedCount++
						var appID int
						dataBytes, _ := json.Marshal(userData)
						var jobID int
						h.DB.QueryRow("SELECT id FROM jobs WHERE hash = $1", job.Hash).Scan(&jobID)

						if jobID > 0 {
							err = h.DB.QueryRow("INSERT INTO applications (job_id, status, method, match_score, submitted_data) VALUES ($1, 'pending', 'auto', $2, $3) RETURNING id",
								jobID, match.Score, dataBytes).Scan(&appID)

							if err == nil {
								go h.runPuppeteerApplier(appID, jobID, job.URL, userData)
							}
						}
					}
				}
			}
		}
	}

	log.Printf("Scrape complete. %d new jobs added to database, %d auto-applied.", newJobsCount, appliedCount)
	h.SendDiscordSummary(totalFound, newJobsCount, appliedCount)
}

// BatchInsertJobs performs an efficient multi-row insert in chunks of 100
func (h *Handler) BatchInsertJobs(jobs []Job) {
	if len(jobs) == 0 {
		return
	}

	const chunkSize = 100
	for i := 0; i < len(jobs); i += chunkSize {
		end := i + chunkSize
		if end > len(jobs) {
			end = len(jobs)
		}
		chunk := jobs[i:end]

		query := "INSERT INTO jobs (title, company, location, url, description, source, hash, supports_auto_apply, ai_score, ai_reasoning, salary_min, salary_max) VALUES "
		vals := []interface{}{}

		for j, job := range chunk {
			n := j * 12
			query += fmt.Sprintf("($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d),", n+1, n+2, n+3, n+4, n+5, n+6, n+7, n+8, n+9, n+10, n+11, n+12)
			vals = append(vals, job.Title, job.Company, job.Location, job.URL, job.Description, job.Source, job.Hash, job.SupportsAutoApply, job.AIScore, job.AIReasoning, job.SalaryMin, job.SalaryMax)
		}

		query = strings.TrimSuffix(query, ",") + " ON CONFLICT (hash) DO NOTHING"

		_, err := h.DB.Exec(query, vals...)
		if err != nil {
			log.Printf("Error during batch insert: %v", err)
		}
	}
}

func (h *Handler) SendDiscordSummary(found, new, applied int) {
	if h.Config.DiscordWebhookURL == "" {
		return
	}

	content := fmt.Sprintf("📊 **Scraper Run Summary (Phase 4 Optimized)**\n"+
		"━━━━━━━━━━━━━━━━━━━━\n"+
		"🔎 **Jobs Found:** %d\n"+
		"✨ **New Relevant Jobs:** %d\n"+
		"🚀 **Auto-Applied:** %d\n"+
		"📅 **Time:** %s",
		found, new, applied, time.Now().Format("Jan 02, 15:04:05"))

	payload := map[string]interface{}{"content": content}
	payloadBytes, _ := json.Marshal(payload)
	http.Post(h.Config.DiscordWebhookURL, "application/json", bytes.NewBuffer(payloadBytes))
}
