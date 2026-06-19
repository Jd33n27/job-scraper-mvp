package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
)

func (h *Handler) ApplyToJob(w http.ResponseWriter, r *http.Request) {
	jobIDStr := chi.URLParam(r, "jobId")
	jobID, err := strconv.Atoi(jobIDStr)
	if err != nil {
		http.Error(w, "Invalid job ID", http.StatusBadRequest)
		return
	}

	var payload struct {
		UserData UserData `json:"user_data"`
		Method   string   `json:"method"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 1. Rate Limiting (1 application per 5 seconds)
	h.applyMu.Lock()
	if time.Since(h.lastApplyTime) < 5*time.Second {
		h.applyMu.Unlock()
		http.Error(w, "Rate limit exceeded. Please wait 5 seconds.", http.StatusTooManyRequests)
		return
	}
	h.lastApplyTime = time.Now()
	h.applyMu.Unlock()

	// 2. Fetch Job URL
	var jobURL string
	err = h.DB.QueryRow("SELECT url FROM jobs WHERE id = $1", jobID).Scan(&jobURL)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	// 3. Insert Application as 'pending'
	var appID int
	dataBytes, _ := json.Marshal(payload.UserData)
	err = h.DB.QueryRow("INSERT INTO applications (job_id, status, method, submitted_data) VALUES ($1, 'pending', $2, $3) RETURNING id",
		jobID, payload.Method, dataBytes).Scan(&appID)
	if err != nil {
		http.Error(w, "Failed to create application record", http.StatusInternalServerError)
		return
	}

	// 4. Run Puppeteer Applier asynchronously
	go h.runPuppeteerApplier(appID, jobID, jobURL, payload.UserData)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Application started", "application_id": appID})
}

func (h *Handler) runPuppeteerApplier(appID, jobID int, jobURL string, userData UserData) {
	log.Printf("Starting Puppeteer applier for Job %d (App %d)", jobID, appID)

	// Correct path: from backend/ folder, go up one and then into scrapers/
	cmd := exec.Command("node", "../scrapers/applier.js", jobURL)

	// Use provided user data
	cmd.Env = append(cmd.Environ(),
		fmt.Sprintf("USER_NAME=%s", userData.Name),
		fmt.Sprintf("USER_EMAIL=%s", userData.Email),
		fmt.Sprintf("USER_PHONE=%s", userData.Phone),
		fmt.Sprintf("GEMINI_API_KEY=%s", h.Config.GeminiAPIKey),
	)

	output, err := cmd.CombinedOutput()

	status := "applied_auto"
	if err != nil {
		log.Printf("Puppeteer script failed: %v\nOutput: %s", err, string(output))
		status = "manual_review"
	}

	// 5. Update status
	_, err = h.DB.Exec("UPDATE applications SET status = $1 WHERE id = $2", status, appID)
	if err != nil {
		log.Printf("Error updating application status: %v", err)
	}

	// 6. Alerting
	h.sendApplicationAlert(jobID, status)
}

func (h *Handler) sendApplicationAlert(jobID int, status string) {
	var title, company string
	err := h.DB.QueryRow("SELECT title, company FROM jobs WHERE id = $1", jobID).Scan(&title, &company)
	if err != nil {
		return
	}

	emoji := "✅"
	if status == "manual_review" {
		emoji = "⚠️"
	}

	msg := fmt.Sprintf("%s **Application Update**\n**Job:** %s\n**Company:** %s\n**Status:** %s",
		emoji, title, company, status)

	// Reuse existing alert logic if possible, or simple POST here
	h.sendDiscordMessage(msg)
}

func (h *Handler) sendDiscordMessage(content string) {
	if h.Config.DiscordWebhookURL == "" {
		return
	}

	payload := map[string]interface{}{"content": content}
	payloadBytes, _ := json.Marshal(payload)
	http.Post(h.Config.DiscordWebhookURL, "application/json", bytes.NewBuffer(payloadBytes))
}
