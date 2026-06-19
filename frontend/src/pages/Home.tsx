import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { RefreshCw } from "lucide-react";
import FilterBar from "../components/FilterBar";
import JobList from "../components/JobList";

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
    } catch (error) {
      console.error("Error triggering scrape:", error);
      alert("Failed to trigger scrape.");
    } finally {
      setScraping(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Available Positions
            </h2>
            <p className="text-gray-500 mt-1">
              Discover your next opportunity from top sources.
            </p>
          </div>
          <button
            onClick={triggerScrape}
            disabled={scraping}
            className="flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${scraping ? "animate-spin" : ""}`}
            />
            {scraping ? "Scraping..." : "Scrape Jobs"}
          </button>
        </div>

        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onApply={handleApplyFilters}
        />

        <JobList jobs={jobs} loading={loading} />
      </div>
    </div>
  );
};

export default Home;
