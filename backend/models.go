package main

import (
	"crypto/sha256"
	"fmt"
	"time"
)

type Job struct {
	ID                int          `json:"id"`
	Title             string       `json:"title"`
	Company           string       `json:"company"`
	Location          string       `json:"location"`
	URL               string       `json:"url"`
	Description       string       `json:"description"`
	Source            string       `json:"source"`
	Hash              string       `json:"hash"`
	CreatedAt         time.Time    `json:"created_at"`
	SupportsAutoApply bool         `json:"supports_auto_apply"`
	AIScore           int          `json:"ai_score"`
	AIReasoning       string       `json:"ai_reasoning"`
	SalaryMin         *int         `json:"salary_min"`
	SalaryMax         *int         `json:"salary_max"`
	ApplicationID     *int         `json:"application_id,omitempty"`
	Match             *MatchResult `json:"match,omitempty"`
}

type Application struct {
	ID            int                    `json:"id"`
	JobID         int                    `json:"job_id"`
	Status        string                 `json:"status"` // pending, applied_auto, manual_review, failed, success, auto_filled
	Method        string                 `json:"method"` // auto_applied, auto_filled, manual
	MatchScore    int                    `json:"match_score"`
	SubmittedData map[string]interface{} `json:"submitted_data"`
	AppliedAt     time.Time              `json:"applied_at"`
	// Joined fields for history view
	JobTitle   string `json:"job_title,omitempty"`
	JobCompany string `json:"job_company,omitempty"`
	JobURL     string `json:"job_url,omitempty"`
}

type CVProfile struct {
	ID                 int       `json:"id"`
	RawText            string    `json:"raw_text"`
	ParsedSkills       []string  `json:"parsed_skills"`
	ExperienceLevel    string    `json:"experience_level"`
	YearsExp           int       `json:"years_exp"`
	PreferredLocations []string  `json:"preferred_locations"`
	PreferredJobTitles []string  `json:"preferred_job_titles"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type MatchLog struct {
	ID          int       `json:"id"`
	JobID       int       `json:"job_id"`
	CVProfileID int       `json:"cv_profile_id"`
	Score       int       `json:"score"`
	Details     string    `json:"details"`
	CreatedAt   time.Time `json:"created_at"`
}

type UserData struct {
	Name   string `json:"name"`
	Email  string `json:"email"`
	Phone  string `json:"phone"`
	Skills string `json:"skills"`
	Bio    string `json:"bio"`
}

type UserSettings struct {
	TargetLocations []string `json:"target_locations"`
	MinSalary       int      `json:"min_salary"`
	Keywords        []string `json:"keywords"`
}

type Stats struct {
	JobsToday         int           `json:"jobs_today"`
	JobsWeek          int           `json:"jobs_week"`
	ApplicationsToday int           `json:"applications_today"`
	TotalApplications int           `json:"total_applications"`
	SuccessRate       float64       `json:"success_rate"`
	TopCompanies      []CompanyStat `json:"top_companies"`
	BySource          []GenericStat `json:"by_source"`
	ByLocation        []GenericStat `json:"by_location"`
	JobsDaily         []DailyStat   `json:"jobs_daily"`
	ApplicationsDaily []DailyStat   `json:"applications_daily"`
}

type DailyStat struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type CompanyStat struct {
	Company string `json:"company"`
	Count   int    `json:"count"`
}

type GenericStat struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type ApplicationPreview struct {
	JobID        int      `json:"job_id"`
	Title        string   `json:"title"`
	Company      string   `json:"company"`
	Requirements []string `json:"requirements"`
	UserData     UserData `json:"user_data"`
}

func GenerateHash(title, url string) string {
	data := fmt.Sprintf("%s%s", title, url)
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("%x", hash)
}
