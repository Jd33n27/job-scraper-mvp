# Job Scraper + Auto-Apply MVP - Build Plan (IDE Agent Optimized)

**Goal:** Working prototype in 4 weeks (AI agent builds, you monitor)  
**Stack:** Go backend + React TS frontend + Supabase + Discord webhooks  
**Budget:** $0  
**Timeline:** Phase 1 (Week 1) → Phase 4 (Week 4)

---

## **Phase 1: Job Scraper + Dashboard**

### **Architecture**

```
Puppeteer Scraper → Supabase DB → Go REST API → React Dashboard
```

### **Deliverables**

1. **Go Backend (Render)**
   - Main entry point with chi router
   - Database connection to Supabase
   - Endpoints: GET /api/jobs, GET /api/jobs/filter, POST /api/scrape, GET /health
   - Environment variable handling (.env file)

2. **React TS Frontend (Vercel)**
   - Job list with filtering (location, salary, keywords)
   - Job detail modal
   - Tailwind styling (functional, minimal design)
   - Fetch from Go backend

3. **Puppeteer Scraper (Node.js)**
   - Scrapes: RemoteOK, Indeed, LinkedIn
   - Job deduplication (by URL + title hash)
   - Rate limiting (2 req/sec per site, random delays)
   - Stores to Supabase directly

4. **Supabase Schema**
   - jobs table (id, title, company, url, location, salary_min, salary_max, description, source, created_at)
   - scrape_logs table (source, jobs_found, jobs_stored, scrape_date)
   - user_settings table (target_locations, min_salary, keywords)

5. **Discord Integration**
   - Webhook sends alert when new matching job found
   - Format: Job title, company, salary, link, source

### **Tech Stack**
- Backend: Go 1.21+ (chi router, pq for PostgreSQL)
- Frontend: React 18, TypeScript, Tailwind CSS, axios
- Scraping: Puppeteer, Node.js
- Database: Supabase PostgreSQL
- Hosting: Render (backend), Vercel (frontend)
- Notifications: Discord webhooks

### **Dependencies**
- Go: chi, pq, godotenv, supabase-go
- Node: puppeteer, dotenv, node-postgres
- React: react, typescript, tailwind, axios

### **Key Implementation Details**
- Use connection pooling for Supabase
- Batch insert jobs (100 at a time)
- Cache job filters in React state
- Store Discord webhook URL in .env
- Log all scraper actions to console initially

---

## **Phase 2: Auto-Apply System**

### **Architecture**

```
Job Posted → Form Detection → Puppeteer Auto-Fill → Discord Alert → Database Record
```

### **Deliverables**

1. **Form Detection (Go)**
   - Parse job posting HTML
   - Detect application method: email, form, external link
   - Extract: apply_email or form_url
   - Return confidence level

2. **Auto-Fill Logic (Puppeteer)**
   - Load job page
   - Find form/email field
   - Auto-fill: name, email, phone, basic message
   - Submit form
   - Return: success/failure + reason

3. **Application Tracking (Supabase)**
   - applications table (id, job_id, user_id, status, applied_at, method, created_at)
   - Status: pending, applied_auto, applied_manual, alert_sent, failed

4. **Auto-Apply Endpoint (Go)**
   - POST /api/apply/{jobId}
   - Triggers Puppeteer auto-fill via spawned process
   - Stores result in applications table
   - Sends Discord notification

5. **React Apply Button**
   - "Apply Now" button on each job card
   - Loading state while applying
   - Success/alert message response
   - Disabled for external links

6. **Discord Alerts**
   - ✅ Auto-applied: "[Company] - [Job]"
   - ⚠️ Manual needed: "[Company] - [Job]" with link
   - ❌ Failed: "[Company] - [Job]" (reason)

### **Key Implementation Details**
- Spawn Puppeteer as subprocess from Go (don't embed)
- Timeout: 30 seconds per application
- Catch form errors gracefully (don't crash)
- Store full form response in database for debugging
- Rate limit: max 1 application per 5 seconds per job site

---

## **Phase 3: Scheduler + Stats Dashboard**

### **Architecture**

```
Cron Job (6h) → Scraper → Discord Summary → Stats Updated → Dashboard Refreshes
```

### **Deliverables**

1. **Scheduler (Go)**
   - Runs scraper every 6 hours automatically
   - Discord summary: "Found X jobs, applied Y, sent Z alerts"
   - Log to file: logs/scraper.log
   - No manual triggering needed

2. **Stats Endpoints (Go)**
   - GET /api/stats (all metrics)
   - Returns: jobs_today, jobs_week, applications_today, success_rate, top_companies
   - GET /api/applications (all my applications with filters)

3. **Stats Dashboard (React)**
   - Line chart: jobs per day (7 days)
   - Line chart: applications per day (7 days)
   - Card: success rate % (auto / total)
   - Table: top companies applied to
   - Table: all applications (with status, date, link)
   - Auto-refresh every 5 minutes

4. **Logging (Go)**
   - File logging: logs/scraper.log, logs/app.log
   - Format: [2026-01-15 14:32:10] ACTION: details
   - Discord alerts only for critical errors (not every action)

5. **Render Deployment**
   - Cron job configuration for scheduler
   - Health check endpoint for Render monitoring

### **Key Implementation Details**
- Use time.Ticker for scheduler (not cron library initially)
- Stats queries optimized with database indexes
- React charts use recharts library
- Log rotation: keep last 30 days of logs
- Retry failed scrapes once automatically

---

## **Phase 4: Multi-Source + Optimization**

### **Architecture**

```
5 Job Sources → Rate Limiting + robots.txt Check → Smart Filtering → Enhanced Stats
```

### **Deliverables**

1. **Additional Scrapers (Puppeteer)**
   - Upwork (free jobs)
   - Fiverr (free gigs)
   - Remote.co
   - FlexJobs (free listings)
   - Rate limiting: 1 req/sec per site, 500ms random delay between requests

2. **robots.txt Compliance (Go)**
   - Check robots.txt before each scrape
   - Respect Crawl-Delay, User-Agent rules
   - Discord alert if robots.txt violation detected

3. **Job Filtering (Go)**
   - Advanced filters: location array, salary range, keywords array
   - Filter profiles: save/load user filters
   - Filter by job type, company, source
   - Endpoint: GET /api/jobs/filter?locations=US,UK&min_salary=50000&keywords=React,Backend

4. **Cover Letter Templates (Go + Supabase)**
   - Store templates in database
   - Variables: {company}, {position}, {salary}
   - Use for email applications
   - Dynamic generation before applying

5. **Advanced Stats (React)**
   - Pie chart: applications by source
   - Bar chart: salary range by location
   - Card: source performance (which gets responses)
   - Card: keywords performance (which keywords get more opportunities)

6. **Database Optimizations (Go)**
   - Add indexes: url (unique), source, created_at, location
   - Connection pooling: maxOpenConns=25
   - Query caching for frequently accessed filters
   - Batch operations (insert 100 at once)

### **Key Implementation Details**
- Each source is independent scraper file
- Uniform error handling across all sources
- Deduplication checks across all sources
- Source tracking in jobs table
- Rate limit state stored in memory (reset daily)

---

## **File Structure**

```
job-scraper/
├── backend/
│   ├── main.go
│   ├── config.go
│   ├── models.go
│   ├── handlers.go
│   ├── scraper.go
│   ├── applier.go
│   ├── stats.go
│   ├── go.mod
│   ├── go.sum
│   ├── .env.example
│   └── logs/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobList.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── StatsDashboard.tsx
│   │   │   └── ApplicationsList.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── Stats.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json

└── scrapers/
    ├── remoteok.js
    ├── indeed.js
    ├── linkedin.js
    ├── upwork.js
    ├── fiverr.js
    ├── remote-co.js
    └── utils.js
```

---

## **Environment Variables**

```
# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# Discord
DISCORD_WEBHOOK_URL=

# Go Server
PORT=8080
NODE_ENV=development

# Scraper
PUPPETEER_HEADLESS=true
SCRAPER_TIMEOUT=30000
RATE_LIMIT_PER_SEC=2
```

---

## **API Contract**

### **Jobs Endpoints**
```
GET /api/jobs
- Response: [{id, title, company, url, location, salary_min, salary_max, source, created_at}]

GET /api/jobs/filter?location=US&min_salary=50000&keywords=React
- Response: filtered jobs array

POST /api/scrape
- Body: {sources: ["remoteok", "indeed"]} (optional)
- Response: {jobs_found: 45, jobs_stored: 42, duplicates_skipped: 3}
```

### **Applications Endpoints**
```
POST /api/apply/{jobId}
- Response: {status: "applied_auto" | "alert_sent" | "failed", message: "..."}

GET /api/applications
- Response: [{id, job_id, status, applied_at, method}]

GET /api/applications/stats
- Response: {total: 50, auto_applied: 35, manual_alerted: 15, success_rate: 70}
```

### **Stats Endpoints**
```
GET /api/stats
- Response: {
    jobs_today: 45,
    jobs_week: 300,
    applications_today: 12,
    applications_week: 85,
    success_rate: 70,
    top_companies: ["Company A", "Company B"],
    by_source: {remoteok: 120, indeed: 80, linkedin: 100}
  }
```

---

## **Deployment Checklist**

### **Phase 1**
- [ ] Create Supabase project
- [ ] Run SQL schema in Supabase
- [ ] Create Discord server + webhook
- [ ] Deploy Go backend to Render
- [ ] Deploy React frontend to Vercel
- [ ] Test scraper manually
- [ ] Test dashboard displays jobs
- [ ] Test Discord alerts

### **Phase 2**
- [ ] Test "Apply Now" button
- [ ] Verify form detection works (5+ jobs)
- [ ] Verify auto-fill works (test manually)
- [ ] Verify applications table populated
- [ ] Test Discord apply notifications

### **Phase 3**
- [ ] Set up Render cron job
- [ ] Verify scheduler runs every 6 hours
- [ ] Test stats dashboard updates
- [ ] Verify Discord summary messages
- [ ] Check logs directory

### **Phase 4**
- [ ] Deploy additional scrapers
- [ ] Verify robots.txt checker
- [ ] Test job filters
- [ ] Test cover letter generation
- [ ] Monitor 200+ jobs/day

---

## **Success Metrics**

| Phase | Metric | Target |
|-------|--------|--------|
| 1 | Jobs scraped/day | 50+ |
| 2 | Applications/day | 10+ |
| 3 | Automated runs | 4/day (every 6h) |
| 4 | Jobs/day from 5 sources | 200+ |

---

## **Prompts for IDE Agent**

### **Phase 1 Prompt**
```
Build a complete job scraper system. Use Go for backend, React for frontend, Puppeteer for scraping.

Requirements:
1. Go backend with chi router on Render
2. Supabase PostgreSQL connection (no hardcoded secrets)
3. REST API: GET /api/jobs, GET /api/jobs/filter, POST /api/scrape
4. Puppeteer scraper for RemoteOK, Indeed, LinkedIn
5. Job deduplication by URL + title hash
6. Rate limiting 2 req/sec per site
7. React TS frontend on Vercel with job list + filters
8. Discord webhook alerts for new jobs
9. All code should follow the file structure in the plan

File structure:
- backend/main.go, config.go, models.go, handlers.go, scraper.go
- frontend/src/components/, src/pages/
- scrapers/ folder with individual site scrapers

Start by creating the main Go backend structure with database setup.
```

### **Phase 2 Prompt**
```
Add auto-apply system to the existing job scraper.

Requirements:
1. Form detection: analyze job HTML, detect email/form/external
2. Puppeteer auto-fill: name, email, phone fields
3. Go endpoint: POST /api/apply/{jobId}
4. Application tracking in database (status: pending, applied_auto, alert_sent)
5. React "Apply Now" button
6. Discord alerts: ✅ applied, ⚠️ manual review needed
7. Error handling: don't crash on complex forms
8. Rate limiting: 1 application per 5 seconds

Add files:
- backend/applier.go (form detection + spawning Puppeteer)
- scrapers/applier.js (Puppeteer auto-fill logic)
- frontend/components/ApplyButton.tsx

Start with form detection logic.
```

### **Phase 3 Prompt**
```
Add scheduler and stats dashboard.

Requirements:
1. Go scheduler: run scraper every 6 hours automatically
2. Discord summary: "Found X, applied Y, sent Z alerts"
3. File logging: logs/scraper.log with timestamps
4. Stats endpoint: GET /api/stats (jobs_today, applications, success_rate, top_companies)
5. React stats dashboard: charts, tables, auto-refresh every 5 minutes
6. recharts for visualization
7. Render cron job configuration

Add files:
- backend/stats.go (stats endpoints)
- backend/scheduler.go (cron scheduling)
- frontend/pages/Stats.tsx
- frontend/components/StatsDashboard.tsx

Start with scheduler setup.
```

### **Phase 4 Prompt**
```
Optimize and add multiple job sources.

Requirements:
1. Add scrapers: Upwork, Fiverr, Remote.co, FlexJobs
2. robots.txt checker before scraping
3. Advanced filtering: location array, salary range, keywords
4. Cover letter templates with variable substitution
5. Advanced stats: by source, by location, by keywords
6. Database indexes on url, source, created_at
7. Batch inserts (100 jobs at a time)

Add files:
- scrapers/upwork.js, fiverr.js, remote-co.js, flexjobs.js
- backend/robots.js (robots.txt checker)
- backend/filter.go (advanced filtering)
- frontend/components/AdvancedStats.tsx

Start with additional scrapers.
```

---

## **Progress Tracker**

| Phase | Status | Date Started | Date Completed |
|-------|--------|--------------|-----------------|
| 1 | ✅ | 2026-06-01 | 2026-06-07 |
| 2 | ✅ | 2026-06-08 | 2026-06-13 |
| 3 | ✅ | 2026-06-14 | 2026-06-14 |
| 4 | ⬜ | | |

---

## **Notes**

- All free services (no credit cards)
- Total time: 4 weeks
- Once generating leads → reinvest in learning + paid infrastructure
- GitHub for version control (commit after each phase)
- Test locally before deploying to production
