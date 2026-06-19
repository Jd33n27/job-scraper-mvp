package main

import (
	"log"
	"time"
)

func (h *Handler) StartScheduler() {
	// 6 hour ticker
	ticker := time.NewTicker(6 * time.Hour)
	log.Println("Internal scheduler started: running every 6 hours.")

	go func() {
		for range ticker.C {
			log.Println("Scheduler triggered: Starting automatic scrape...")
			h.RunScraper()
		}
	}()
}
