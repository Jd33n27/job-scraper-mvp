import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { RefreshCw, ExternalLink, Copy, FileText, AlertCircle } from "lucide-react";
import FilterBar from "../components/FilterBar";
import JobList from "../components/JobList";
import ApplyButton from "../components/ApplyButton";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  source: string;
  created_at: string;
  supports_auto_apply: boolean;
  ai_score: number;
  ai_reasoning: string;
  salary_min: number | null;
  salary_max: number | null;
  application_id?: number | null;
  match?: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    details?: string;
  };
}

import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

const Home: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    supportsAutoApply: false,
    minSalary: 0,
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [clLoading, setClLoading] = useState<boolean>(false);
  const [clError, setClError] = useState<string>("");

  // Use a ref to always have access to latest filters without re-triggering the fetchJobs stable reference
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs/filter`, {
        params: {
          ...filtersRef.current,
          supportsAutoApply: filtersRef.current.supportsAutoApply
            ? "true"
            : "false",
        },
      });
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApplyFilters = () => {
    setLoading(true);
    fetchJobs();
  };

  const triggerScrape = async () => {
    setScraping(true);
    try {
      await axios.post(`${API_URL}/scrape`);
      alert("Scraping triggered! New jobs will appear shortly.");
      fetchJobs();
    } catch (error) {
      console.error("Error triggering scrape:", error);
      alert("Failed to trigger scrape.");
    } finally {
      setScraping(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setCoverLetter("");
    setClError("");
  }, [selectedJob]);

  const generateCL = async () => {
    if (!selectedJob) return;
    setClLoading(true);
    setClError("");
    try {
      const response = await axios.post(`${API_URL}/cover-letter`, {
        job_id: selectedJob.id,
      });
      setCoverLetter(response.data.cover_letter || "");
    } catch (err: any) {
      console.error(err);
      setClError("AI failed to generate cover letter. Verify database connection.");
    } finally {
      setClLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="h-full flex flex-col bg-brand-cream overflow-y-auto lg:overflow-hidden p-4 sm:p-6 font-sans">
      {/* Dynamic Filter Row (Border Divider, Flat Style) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-brand-border select-none shrink-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="font-sans text-xs font-bold text-brand-forest uppercase tracking-wider">
            Filters:
          </span>
          <div className="flex-1 md:flex-none">
            <FilterBar filters={filters} setFilters={setFilters} onApply={handleApplyFilters} />
          </div>
        </div>
        <button
          onClick={triggerScrape}
          disabled={scraping}
          className="bento-btn shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scraping ? "animate-spin" : ""}`} />
          {scraping ? "Scraping..." : "Re-Index Sources"}
        </button>
      </div>

      {/* Responsive Grid Layout (Full width columns on mobile, 3-column layout on desktop) */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left Column: Job List Catalog */}
        <div className="col-span-12 lg:col-span-4 h-[350px] lg:h-full flex flex-col overflow-hidden min-w-0">
          <div className="font-serif text-sm font-bold text-brand-forest mb-2 flex items-center justify-between select-none">
            <span>Active Catalog</span>
            <span className="font-mono text-xs text-brand-muted-text font-bold bg-brand-sage px-2 py-0.5 rounded-full">{jobs.length} Jobs</span>
          </div>
          <div className="flex-1 overflow-hidden min-h-0 py-1">
            <JobList
              jobs={jobs}
              loading={loading}
              onSelect={setSelectedJob}
              selectedJobId={selectedJob?.id}
            />
          </div>
        </div>

        {/* Middle Column: Detail Analytics Workspace */}
        <div className="col-span-12 lg:col-span-4 h-fit lg:h-full flex flex-col overflow-hidden min-w-0">
          <div className="font-serif text-sm font-bold text-brand-forest mb-2 select-none">
            <span>Workspace &amp; Analysis</span>
          </div>
          <div className="flex-1 py-1 overflow-y-auto flex flex-col gap-4 min-h-0">
            {selectedJob ? (
              <>
                {/* Title Card */}
                <div className="border-b border-brand-border pb-3">
                  <span className="text-[10px] uppercase font-bold text-brand-terracotta font-mono tracking-widest bg-brand-cream px-2 py-0.5 rounded border border-brand-border">
                    {selectedJob.source}
                  </span>
                  <h3 className="text-base font-serif font-black text-brand-forest leading-snug mt-2">
                    {selectedJob.title}
                  </h3>
                  <div className="text-xs text-brand-muted-text font-semibold mt-1.5 font-sans">
                    {selectedJob.company} &bull; {selectedJob.location || "Remote"}
                  </div>
                  {selectedJob.salary_min && (
                    <div className="text-xs text-brand-terracotta font-mono mt-2 font-bold bg-brand-cream/80 px-2 py-0.5 rounded border border-brand-border/65 w-fit">
                      Est. Salary: ${selectedJob.salary_min}k - ${selectedJob.salary_max}k
                    </div>
                  )}
                </div>

                {/* AI Alignment Score */}
                <div className="py-3 border-b border-brand-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-[11px] font-bold text-brand-forest uppercase tracking-wider">
                      AI Alignment Index
                    </span>
                    <span className="font-mono text-xs font-black text-brand-terracotta bg-brand-sage px-2 py-0.5 rounded border border-brand-border">
                      {selectedJob.match ? selectedJob.match.score : selectedJob.ai_score}%
                    </span>
                  </div>
                  {selectedJob.ai_reasoning && (
                    <div className="font-sans text-xs leading-relaxed text-brand-muted-text bg-white p-3 rounded-lg border border-brand-border">
                      {selectedJob.ai_reasoning}
                    </div>
                  )}
                </div>

                {/* Skills Matrix */}
                {selectedJob.match && (
                  <div className="py-3 border-b border-brand-border">
                    <div className="font-sans text-[10px] font-bold text-brand-forest uppercase tracking-wider mb-2">
                      CV Match Matrix
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {(selectedJob.match.matched_skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="bg-[#EBF7EE] border border-[#C5ECD0] text-[#1E5D2F] px-2 py-0.5 rounded text-[10px] font-sans font-bold"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(selectedJob.match.missing_skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="bg-[#FDF2ED] border border-[#FAD6C5] text-[#A64115] px-2 py-0.5 rounded text-[10px] font-sans font-bold"
                          >
                            ✗ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Options */}
                <div className="py-3 border-b border-brand-border flex flex-wrap gap-2 items-center justify-between">
                  <span className="font-sans text-[10px] font-bold text-brand-forest uppercase tracking-wider">
                    Portal Actions
                  </span>
                  <div className="flex gap-2 items-center">
                    <a
                      href={selectedJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bento-btn bento-btn-secondary py-1 text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      External Tab
                    </a>
                    {selectedJob.supports_auto_apply && (
                      <ApplyButton
                        jobId={selectedJob.id}
                        applicationId={selectedJob.application_id}
                      />
                    )}
                  </div>
                </div>

                {/* AI Cover Letter Builder */}
                <div className="py-3 mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans text-[10px] font-bold text-brand-forest uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-forest" />
                      Application Cover Letter
                    </span>
                    {coverLetter && (
                      <button
                        onClick={() => copyToClipboard(coverLetter)}
                        className="bento-btn py-0.5 px-2.5 text-[11px]"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Text
                      </button>
                    )}
                  </div>

                  {!coverLetter ? (
                    <div className="text-center py-5 bg-brand-cream/30 border border-dashed border-brand-border rounded-lg">
                      <p className="text-xs text-brand-muted-text mb-3 px-4">
                        Draft a highly targeted cover letter aligned with this job and your parsed CV details.
                      </p>
                      <button
                        onClick={generateCL}
                        disabled={clLoading}
                        className="bento-btn text-xs py-1.5"
                      >
                        {clLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            Drafting...
                          </>
                        ) : (
                          "Draft Cover Letter"
                        )}
                      </button>
                      {clError && (
                        <div className="mt-2 text-[10px] text-red-600 flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-3 h-3" />
                          {clError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      className="w-full h-24 p-2.5 font-mono text-xs border border-brand-border rounded-lg leading-relaxed resize-none overflow-y-auto focus:outline-none focus:border-brand-terracotta"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-brand-muted-text font-sans text-xs py-12">
                <FileText className="w-8 h-8 text-brand-border mb-3" />
                Select job item from the catalog.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Portal Integration Webview */}
        <div className="col-span-12 lg:col-span-4 h-[400px] lg:h-full flex flex-col overflow-hidden min-w-0">
          <div className="font-serif text-sm font-bold text-brand-forest mb-2 flex items-center justify-between select-none">
            <span>Embedded Portal</span>
            {selectedJob && (
              <span className="font-mono text-[10px] truncate max-w-40 text-brand-muted-text">
                {selectedJob.url}
              </span>
            )}
          </div>
          <div className="flex-1 bg-white overflow-hidden relative border border-brand-border rounded-xl shadow-sm">
            {selectedJob ? (
              <iframe
                src={`${API_BASE_URL}/proxy?url=${encodeURIComponent(selectedJob.url)}`}
                className="w-full h-full border-0 bg-white"
                title="Job Portal WebView"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center text-brand-muted-text font-sans text-xs p-5">
                <ExternalLink className="w-8 h-8 text-brand-border mb-3" />
                No active portal loaded.<br />
                Apply directly within this frame.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
