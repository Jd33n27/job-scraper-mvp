package main

import (
	"strings"
)

// FilterOptions defines the criteria for local pre-filtering
type FilterOptions struct {
	RequiredKeywords   []string
	ExcludedKeywords   []string
	PreferredLocations []string
	MinSalary          int
}

// PreFilterJobs performs strict local filtering to save AI quota
func (h *Handler) PreFilterJobs(jobs []Job, user UserData, settings UserSettings) []Job {
	// 1. Define default keywords based on user skills and settings
	required := []string{"junior", "entry", "intern", "associate"}
	if user.Skills != "" {
		skills := strings.Split(strings.ToLower(user.Skills), ",")
		for _, s := range skills {
			s = strings.TrimSpace(s)
			if s != "" {
				required = append(required, s)
			}
		}
	}

	// Add user-defined keywords from settings
	for _, k := range settings.Keywords {
		k = strings.TrimSpace(strings.ToLower(k))
		if k != "" {
			required = append(required, k)
		}
	}

	excluded := []string{"senior", "lead", "staff", "principal", "architect", "manager", "director"}

	var filtered []Job
	for _, job := range jobs {
		title := strings.ToLower(job.Title)
		desc := strings.ToLower(job.Description)
		location := strings.ToLower(job.Location)

		// Rule 1: Must NOT contain excluded keywords in title
		isExcluded := false
		for _, ex := range excluded {
			if strings.Contains(title, ex) {
				isExcluded = true
				break
			}
		}
		if isExcluded {
			continue
		}

		// Rule 2: Must contain at least one required keyword (skill or level) in title or description
		hasRequired := false
		for _, req := range required {
			if strings.Contains(title, req) || strings.Contains(desc, req) {
				hasRequired = true
				break
			}
		}

		// Rule 4: Remote check (always a preference)
		isRemote := strings.Contains(location, "remote") ||
			strings.Contains(title, "remote") ||
			strings.Contains(desc, "remote")

		// Rule 3: Location check if target locations are specified
		locationMatch := len(settings.TargetLocations) == 0
		for _, loc := range settings.TargetLocations {
			locLower := strings.ToLower(loc)
			if strings.Contains(location, locLower) ||
				(locLower == "remote" && (isRemote || strings.Contains(location, "worldwide") || strings.Contains(location, "anywhere") || strings.Contains(location, "global"))) {
				locationMatch = true
				break
			}
		}

		if hasRequired && !isExcluded && locationMatch {
			// Boost score slightly if it's remote
			if isRemote && !strings.Contains(job.Location, "Remote") {
				job.Location = "Remote (" + job.Location + ")"
			}
			filtered = append(filtered, job)
		}
	}

	return filtered
}
