package main

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "github.com/lib/pq"
)

func main() {
	cfg := LoadConfig()

	// 1. Setup Logging to both stdout and a file
	_ = os.MkdirAll("logs", 0755)
	logFile, err := os.OpenFile("logs/scraper.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Error opening log file: %v\n", err)
	} else {
		multiWriter := io.MultiWriter(os.Stdout, logFile)
		log.SetOutput(multiWriter)
	}

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Error opening database: %v\nNote: If your password has special characters, try URL encoding them (e.g., @ as %%40) or check the format.", err)
	}
	defer db.Close()

	// Configure connection pooling (Phase 4 Optimization)
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(10 * time.Minute)

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	// 1.5 Initialize Database Schema
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS profile (
			id SERIAL PRIMARY KEY,
			name TEXT,
			email TEXT,
			phone TEXT,
			skills TEXT,
			bio TEXT,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);

		-- Insert default profile if not exists
		INSERT INTO profile (id, name, email, phone, skills, bio)
		SELECT 1, 'Musa Jamaldeen', 'musajamaldeen627@gmail.com', '+234 8077127417', 'React, Next.js, TypeScript, JavaScript (ES6+), Go, HTML5, CSS3, Tailwind CSS, Bootstrap, Figma', 'Computer Science student and Frontend Developer specializing in React, Next.js, and TypeScript. Experienced in building scalable web applications with a focus on clean UI/UX and efficient state management.'
		WHERE NOT EXISTS (SELECT 1 FROM profile WHERE id = 1);

		-- Update profile if it still contains old defaults
		UPDATE profile 
		SET name = 'Musa Jamaldeen', 
		    email = 'musajamaldeen627@gmail.com', 
		    phone = '+234 8077127417', 
		    skills = 'React, Next.js, TypeScript, JavaScript (ES6+), Go, HTML5, CSS3, Tailwind CSS, Bootstrap, Figma', 
		    bio = 'Computer Science student and Frontend Developer specializing in React, Next.js, and TypeScript. Experienced in building scalable web applications with a focus on clean UI/UX and efficient state management.'
		WHERE id = 1 AND (name = 'Default Name' OR name = 'Default User' OR name IS NULL OR name = '');

		-- Ensure new columns exist (idempotent)
		DO $$
		BEGIN
			BEGIN
				ALTER TABLE profile ADD COLUMN skills TEXT;
			EXCEPTION
				WHEN duplicate_column THEN RAISE NOTICE 'column skills already exists in profile';
			END;
			BEGIN
				ALTER TABLE profile ADD COLUMN bio TEXT;
			EXCEPTION
				WHEN duplicate_column THEN RAISE NOTICE 'column bio already exists in profile';
			END;
			BEGIN
				ALTER TABLE jobs ADD COLUMN salary_min INTEGER;
			EXCEPTION
				WHEN duplicate_column THEN RAISE NOTICE 'column salary_min already exists in jobs';
			END;
			BEGIN
				ALTER TABLE jobs ADD COLUMN salary_max INTEGER;
			EXCEPTION
				WHEN duplicate_column THEN RAISE NOTICE 'column salary_max already exists in jobs';
			END;
			BEGIN
				ALTER TABLE applications ADD COLUMN match_score INTEGER DEFAULT 0;
			EXCEPTION
				WHEN duplicate_column THEN RAISE NOTICE 'column match_score already exists in applications';
			END;
			BEGIN
				ALTER TABLE applications ADD COLUMN method TEXT;
			EXCEPTION
				WHEN duplicate_column THEN RAISE NOTICE 'column method already exists in applications';
			END;
			BEGIN
				ALTER TABLE applications ADD COLUMN submitted_data JSONB;
			EXCEPTION
				WHEN duplicate_column THEN RAISE NOTICE 'column submitted_data already exists in applications';
			END;
			BEGIN
				ALTER TABLE applications ADD COLUMN cover_letter TEXT;
			EXCEPTION
				WHEN duplicate_column THEN RAISE NOTICE 'column cover_letter already exists in applications';
			END;
		END $$;

		CREATE TABLE IF NOT EXISTS cv_profiles (
			id SERIAL PRIMARY KEY,
			raw_text TEXT,
			parsed_skills TEXT[],
			experience_level TEXT,
			years_exp INTEGER,
			preferred_locations TEXT[],
			preferred_job_titles TEXT[],
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS match_log (
			id SERIAL PRIMARY KEY,
			job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
			cv_profile_id INTEGER REFERENCES cv_profiles(id) ON DELETE CASCADE,
			score INTEGER,
			details TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS system_errors (
			id SERIAL PRIMARY KEY,
			component TEXT NOT NULL,
			error_message TEXT NOT NULL,
			stack_trace TEXT,
			severity TEXT DEFAULT 'error',
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS gemini_usage (
			id SERIAL PRIMARY KEY,
			endpoint TEXT,
			prompt_tokens INTEGER,
			response_tokens INTEGER,
			model TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS user_settings (
			id SERIAL PRIMARY KEY,
			target_locations TEXT[],
			min_salary INTEGER,
			keywords TEXT[],
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);

		INSERT INTO user_settings (id, target_locations, min_salary, keywords)
		SELECT 1, '{}', 0, '{}'
		WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE id = 1);

		-- Additional indexes for optimization
		CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
		CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
		CREATE INDEX IF NOT EXISTS idx_cv_parsed_skills ON cv_profiles USING GIN (parsed_skills);
	`)
	if err != nil {
		log.Printf("Warning: Database initialization error: %v", err)
	}

	h := &Handler{
		DB:     db,
		Config: cfg,
	}

	// 1.7 Seed CV Profile from cv.txt if empty
	h.SeedCVProfile()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Basic CORS settings
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/api", func(r chi.Router) {
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("ok"))
		})
		r.Get("/system/health", h.GetSystemHealth)
		r.Get("/jobs", h.GetJobs)
		r.Get("/jobs/filter", h.FilterJobs)
		r.Get("/jobs/recommended", h.GetRecommendedJobs)
		r.Get("/jobs/{jobId}/match", h.GetJobMatch)
		r.Get("/stats", h.GetStats)
		r.Get("/stats/matching", h.GetMatchingStats)
		r.Post("/scrape", h.ScrapeJobs)
		r.Get("/scrape", h.ScrapeJobs)
		r.Post("/cover-letter", h.GenerateCoverLetter)
		r.Get("/jobs/{jobId}/preview", h.GetApplicationPreview)
		r.Post("/jobs/{jobId}/apply", h.ApplyToJob)
		r.Post("/apply/smart", h.SmartApply)
		r.Get("/applications", h.GetApplications)
		r.Get("/applications/{appId}", h.GetApplicationTraceback)
		r.Put("/applications/{appId}/resolve", h.ResolveApplication)
		r.Get("/profile", h.GetProfile)
		r.Put("/profile", h.UpdateProfile)
		r.Get("/settings", h.GetUserSettings)
		r.Put("/settings", h.UpdateUserSettings)
		r.Post("/cv/upload", h.UploadCV)
		r.Get("/cv/profile", h.GetCVProfile)
		r.Put("/cv/profile", h.UpdateCVProfile)
		r.Get("/proxy", h.ProxyJobPage)
	})

	fmt.Printf("Server starting on port %s...\n", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
