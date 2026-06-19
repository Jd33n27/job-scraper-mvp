package main

import (
	"encoding/json"
	"net/http"
	"time"
)

func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	var stats Stats

	// 1. Jobs created today
	err := h.DB.QueryRow("SELECT COUNT(*) FROM jobs WHERE created_at >= CURRENT_DATE").Scan(&stats.JobsToday)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 1b. Jobs created this week
	err = h.DB.QueryRow("SELECT COUNT(*) FROM jobs WHERE created_at >= NOW() - INTERVAL '7 days'").Scan(&stats.JobsWeek)
	if err != nil {
		stats.JobsWeek = 0
	}

	// 1c. Applications submitted today
	err = h.DB.QueryRow("SELECT COUNT(*) FROM applications WHERE applied_at >= CURRENT_DATE").Scan(&stats.ApplicationsToday)
	if err != nil {
		stats.ApplicationsToday = 0
	}

	// 2. Total successful applications
	err = h.DB.QueryRow("SELECT COUNT(*) FROM applications WHERE status IN ('applied_auto', 'success')").Scan(&stats.TotalApplications)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Success rate (Applied / Total Attempted)
	var totalAttempted int
	err = h.DB.QueryRow("SELECT COUNT(*) FROM applications").Scan(&totalAttempted)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if totalAttempted > 0 {
		stats.SuccessRate = (float64(stats.TotalApplications) / float64(totalAttempted)) * 100
	} else {
		stats.SuccessRate = 0
	}

	// 4. Top companies
	rows, err := h.DB.Query(`
		SELECT company, COUNT(*) as count
		FROM jobs
		GROUP BY company
		ORDER BY count DESC
		LIMIT 5
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var cs CompanyStat
			if err := rows.Scan(&cs.Company, &cs.Count); err == nil {
				stats.TopCompanies = append(stats.TopCompanies, cs)
			}
		}
	}

	// 5. Stats by Source
	sourceRows, err := h.DB.Query(`
		SELECT source, COUNT(*) as count
		FROM jobs
		GROUP BY source
		ORDER BY count DESC
	`)
	if err == nil {
		defer sourceRows.Close()
		for sourceRows.Next() {
			var gs GenericStat
			if err := sourceRows.Scan(&gs.Name, &gs.Count); err == nil {
				stats.BySource = append(stats.BySource, gs)
			}
		}
	}

	// 6. Stats by Location
	locationRows, err := h.DB.Query(`
		SELECT
			CASE
				WHEN location ILIKE '%remote%' THEN 'Remote'
				WHEN location = '' OR location IS NULL THEN 'Unknown'
				ELSE 'On-site/Hybrid'
			END as loc_group,
			COUNT(*) as count
		FROM jobs
		GROUP BY loc_group
		ORDER BY count DESC
	`)
	if err == nil {
		defer locationRows.Close()
		for locationRows.Next() {
			var gs GenericStat
			if err := locationRows.Scan(&gs.Name, &gs.Count); err == nil {
				stats.ByLocation = append(stats.ByLocation, gs)
			}
		}
	}

	// 7. Timeseries metrics (7 days) with zero-padding
	dailyJobsMap := make(map[string]int)
	dailyAppsMap := make(map[string]int)
	for i := 6; i >= 0; i-- {
		dateStr := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		dailyJobsMap[dateStr] = 0
		dailyAppsMap[dateStr] = 0
	}

	jobDailyRows, err := h.DB.Query(`
		SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as day, COUNT(*)
		FROM jobs
		WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
		GROUP BY day
	`)
	if err == nil {
		defer jobDailyRows.Close()
		for jobDailyRows.Next() {
			var date string
			var count int
			if err := jobDailyRows.Scan(&date, &count); err == nil {
				dailyJobsMap[date] = count
			}
		}
	}

	appDailyRows, err := h.DB.Query(`
		SELECT TO_CHAR(applied_at, 'YYYY-MM-DD') as day, COUNT(*)
		FROM applications
		WHERE applied_at >= CURRENT_DATE - INTERVAL '6 days'
		GROUP BY day
	`)
	if err == nil {
		defer appDailyRows.Close()
		for appDailyRows.Next() {
			var date string
			var count int
			if err := appDailyRows.Scan(&date, &count); err == nil {
				dailyAppsMap[date] = count
			}
		}
	}

	stats.JobsDaily = []DailyStat{}
	stats.ApplicationsDaily = []DailyStat{}
	for i := 6; i >= 0; i-- {
		dateStr := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		t, _ := time.Parse("2006-01-02", dateStr)
		displayDate := t.Format("Jan 02")

		stats.JobsDaily = append(stats.JobsDaily, DailyStat{
			Date:  displayDate,
			Count: dailyJobsMap[dateStr],
		})
		stats.ApplicationsDaily = append(stats.ApplicationsDaily, DailyStat{
			Date:  displayDate,
			Count: dailyAppsMap[dateStr],
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
