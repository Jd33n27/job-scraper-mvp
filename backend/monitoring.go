package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type SystemHealth struct {
	Status        string          `json:"status"`
	Uptime        string          `json:"uptime"`
	TotalJobs     int             `json:"total_jobs"`
	GeminiUsage   int             `json:"gemini_usage"`
	RecentErrors  []SystemError   `json:"recent_errors"`
	ScraperHealth []ScraperHealth `json:"scraper_health"`
}

type SystemError struct {
	ID           int       `json:"id"`
	Component    string    `json:"component"`
	ErrorMessage string    `json:"error_message"`
	Severity     string    `json:"severity"`
	CreatedAt    time.Time `json:"created_at"`
}

type ScraperHealth struct {
	Source     string    `json:"source"`
	LastRun    time.Time `json:"last_run"`
	Status     string    `json:"status"`
	JobsStored int       `json:"jobs_stored"`
}

var startTime = time.Now()

func (h *Handler) LogError(component, errStr, stack string) {
	log.Printf("[ERROR][%s] %s", component, errStr)
	_, err := h.DB.Exec("INSERT INTO system_errors (component, error_message, stack_trace) VALUES ($1, $2, $3)", component, errStr, stack)
	if err != nil {
		log.Printf("Failed to log error to DB: %v", err)
	}
}

func (h *Handler) LogGeminiUsage(endpoint string) {
	_, err := h.DB.Exec("INSERT INTO gemini_usage (endpoint, model) VALUES ($1, $2)", endpoint, "gemini-2.0-flash")
	if err != nil {
		log.Printf("Failed to log gemini usage to DB: %v", err)
	}
}

func (h *Handler) GetSystemHealth(w http.ResponseWriter, r *http.Request) {
	health := SystemHealth{
		Status: "Operational",
		Uptime: time.Since(startTime).String(),
	}

	// 1. Get Total Jobs
	h.DB.QueryRow("SELECT COUNT(*) FROM jobs").Scan(&health.TotalJobs)

	// 2. Get Gemini Usage (last 24h)
	h.DB.QueryRow("SELECT COUNT(*) FROM gemini_usage WHERE created_at >= NOW() - INTERVAL '24 hours'").Scan(&health.GeminiUsage)

	// 3. Get Recent Errors
	rows, err := h.DB.Query("SELECT id, component, error_message, severity, created_at FROM system_errors ORDER BY created_at DESC LIMIT 10")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var e SystemError
			if err := rows.Scan(&e.ID, &e.Component, &e.ErrorMessage, &e.Severity, &e.CreatedAt); err == nil {
				health.RecentErrors = append(health.RecentErrors, e)
			}
		}
	}

	// 4. Get Scraper Health
	sRows, err := h.DB.Query(`
		SELECT source, MAX(scrape_date) as last_run, SUM(jobs_stored) as total_stored
		FROM scrape_logs
		GROUP BY source
	`)
	if err == nil {
		defer sRows.Close()
		for sRows.Next() {
			var sh ScraperHealth
			if err := sRows.Scan(&sh.Source, &sh.LastRun, &sh.JobsStored); err == nil {
				sh.Status = "Healthy"
				if time.Since(sh.LastRun) > 24*time.Hour {
					sh.Status = "Stale"
				}
				health.ScraperHealth = append(health.ScraperHealth, sh)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(health)
}
