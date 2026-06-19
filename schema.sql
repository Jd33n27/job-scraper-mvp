CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    url TEXT NOT NULL,
    description TEXT,
    source TEXT,
    hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    supports_auto_apply BOOLEAN DEFAULT FALSE,
    ai_score INTEGER,
    ai_reasoning TEXT,
    salary_min INTEGER,
    salary_max INTEGER
);

CREATE TABLE scrape_logs (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    jobs_found INTEGER DEFAULT 0,
    jobs_stored INTEGER DEFAULT 0,
    scrape_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    target_locations TEXT[],
    min_salary INTEGER,
    keywords TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cv_profiles (
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

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'applied_auto', 'manual_review', 'failed')),
    method TEXT,
    match_score INTEGER DEFAULT 0,
    submitted_data JSONB,
    cover_letter TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_log (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    cv_profile_id INTEGER REFERENCES cv_profiles(id) ON DELETE CASCADE,
    score INTEGER,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_errors (
    id SERIAL PRIMARY KEY,
    component TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity TEXT DEFAULT 'error',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gemini_usage (
    id SERIAL PRIMARY KEY,
    endpoint TEXT,
    prompt_tokens INTEGER,
    response_tokens INTEGER,
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_hash ON jobs(hash);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_cv_parsed_skills ON cv_profiles USING GIN (parsed_skills);
