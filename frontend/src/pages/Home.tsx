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
    <div className="h-full flex flex-col bg-[#e4e4e4] overflow-hidden p-1.5 font-sans">
      {/* Dense Finder-like Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 border border-[#808080] bg-[#cccccc] p-1.5 mb-1.5 select-none shadow-[inset_1px_1px_0_#fff] shrink-0">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="font-sans text-[11px] font-bold text-black uppercase">
            Parameters:
          </span>
          <div className="flex-1 md:flex-none">
            <FilterBar filters={filters} setFilters={setFilters} onApply={handleApplyFilters} />
          </div>
        </div>
        <button
          onClick={triggerScrape}
          disabled={scraping}
          className="mac-btn shrink-0"
        >
          <RefreshCw className={`w-3 h-3 ${scraping ? "animate-spin" : ""}`} />
          {scraping ? "Indexing..." : "Re-index Catalog"}
        </button>
      </div>

      {/* Main Split Window */}
      <div className="flex-1 grid grid-cols-12 gap-1.5 min-h-0 overflow-hidden">
        {/* Left Column (30%): Job Catalog (Finder list) */}
        <div className="col-span-4 h-full flex flex-col overflow-hidden min-w-0">
          <div className="bg-[#cccccc] border-t border-l border-r border-[#808080] px-2 py-0.5 font-sans font-bold text-[10px] text-black shadow-[inset_1px_1px_0_#fff] uppercase flex items-center justify-between select-none">
            <span>Items Catalog</span>
            <span>Count: {jobs.length}</span>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <JobList
              jobs={jobs}
              loading={loading}
              onSelect={setSelectedJob}
              selectedJobId={selectedJob?.id}
            />
          </div>
        </div>

        {/* Middle Column (35%): AI Analyzer & Workspace */}
        <div className="col-span-4 h-full flex flex-col overflow-hidden min-w-0">
          <div className="bg-[#cccccc] border-t border-l border-r border-[#808080] px-2 py-0.5 font-sans font-bold text-[10px] text-black shadow-[inset_1px_1px_0_#fff] uppercase select-none">
            <span>Metadata &amp; Workspace</span>
          </div>
          <div className="flex-1 border border-[#808080] bg-white p-2.5 overflow-y-auto panel-inset flex flex-col gap-3 min-h-0">
            {selectedJob ? (
              <>
                {/* Title Card */}
                <div className="border-b border-[#cccccc] pb-2">
                  <span className="text-[10px] uppercase font-bold text-[#0a5fcf] font-mono tracking-wider">
                    {selectedJob.source}
                  </span>
                  <h3 className="text-sm font-bold text-black leading-tight mt-0.5">
                    {selectedJob.title}
                  </h3>
                  <div className="text-xs text-gray-800 font-medium mt-1 font-mono">
                    {selectedJob.company} &bull; {selectedJob.location || "Remote"}
                  </div>
                  {selectedJob.salary_min && (
                    <div className="text-[11px] text-green-700 font-mono mt-1 font-bold">
                      Salary: ${selectedJob.salary_min}k - ${selectedJob.salary_max}k
                    </div>
                  )}
                </div>

                {/* AI Alignment Score */}
                <div className="border border-[#c0c0c0] bg-[#f7f7f9] p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[11px] font-bold text-black uppercase">
                      AI Alignment Index
                    </span>
                    <span className="font-mono text-xs font-black text-[#0a5fcf] bg-blue-50 px-1 border border-blue-200">
                      {selectedJob.match ? selectedJob.match.score : selectedJob.ai_score}%
                    </span>
                  </div>
                  {selectedJob.ai_reasoning && (
                    <div className="mt-2 font-mono text-[10.5px] leading-relaxed text-gray-700 bg-white p-1.5 border border-[#eaeaea]">
                      {selectedJob.ai_reasoning}
                    </div>
                  )}
                </div>

                {/* Skills Analysis */}
                {selectedJob.match && (
                  <div className="border border-[#c0c0c0] bg-white p-2">
                    <div className="font-sans text-[10px] font-bold text-black uppercase mb-1.5">
                      CV Match Matrix
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap gap-1">
                        {(selectedJob.match.matched_skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="bg-[#e2f0d9] border border-[#a8d08d] text-[#375623] px-1 text-[10px] font-mono font-bold"
                          >
                            + {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(selectedJob.match.missing_skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="bg-[#fce4d6] border border-[#f8cbad] text-[#c65911] px-1 text-[10px] font-mono font-bold"
                          >
                            - {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Triggers */}
                <div className="border border-[#c0c0c0] bg-[#f7f7f9] p-2 flex flex-wrap gap-2 items-center justify-between">
                  <span className="font-sans text-[10px] font-bold text-black uppercase">
                    System Actions
                  </span>
                  <div className="flex gap-2 items-center">
                    <a
                      href={selectedJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mac-btn flex items-center"
                    >
                      <ExternalLink className="w-3 h-3" />
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

                {/* AI Cover Letter Assistant */}
                <div className="border border-[#c0c0c0] p-2 mt-auto">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-sans text-[10px] font-bold text-black uppercase flex items-center gap-1">
                      <FileText className="w-3 h-3 text-black" />
                      AI Application Kit
                    </span>
                    {coverLetter && (
                      <button
                        onClick={() => copyToClipboard(coverLetter)}
                        className="mac-btn"
                        style={{ padding: "1px 6px", fontSize: "10px" }}
                      >
                        <Copy className="w-2.5 h-2.5 mr-1" />
                        Copy Text
                      </button>
                    )}
                  </div>

                  {!coverLetter ? (
                    <div className="text-center py-4 bg-[#f9f9f9] border border-[#e0e0e0]">
                      <p className="text-[10px] font-mono text-gray-500 mb-2">
                        Draft a highly targeted cover letter matching your CV profile.
                      </p>
                      <button
                        onClick={generateCL}
                        disabled={clLoading}
                        className="mac-btn"
                      >
                        {clLoading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                            Drafting...
                          </>
                        ) : (
                          "Draft Cover Letter"
                        )}
                      </button>
                      {clError && (
                        <div className="mt-1 text-[9px] font-mono text-red-600 flex items-center justify-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          {clError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      className="w-full h-24 p-1.5 font-mono text-[10.5px] border border-[#a0a0a0] leading-relaxed resize-none overflow-y-auto focus:outline-none"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 font-mono text-xs">
                <FileText className="w-8 h-8 text-gray-400 mb-2" />
                Select job item from the catalog.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (35%): Portal (Job form view) */}
        <div className="col-span-4 h-full flex flex-col overflow-hidden min-w-0">
          <div className="bg-[#cccccc] border-t border-l border-r border-[#808080] px-2 py-0.5 font-sans font-bold text-[10px] text-black shadow-[inset_1px_1px_0_#fff] uppercase flex items-center justify-between select-none">
            <span>External Application Portal</span>
            {selectedJob && (
              <span className="font-mono text-[9px] truncate max-w-40 text-gray-600">
                {selectedJob.url}
              </span>
            )}
          </div>
          <div className="flex-1 border border-[#808080] bg-[#d0d0d0] relative overflow-hidden panel-inset">
            {selectedJob ? (
              <iframe
                src={`${API_BASE_URL}/proxy?url=${encodeURIComponent(selectedJob.url)}`}
                className="w-full h-full border-0 bg-white"
                title="Job Portal WebView"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500 font-mono text-xs p-4">
                <ExternalLink className="w-8 h-8 text-gray-400 mb-2" />
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
