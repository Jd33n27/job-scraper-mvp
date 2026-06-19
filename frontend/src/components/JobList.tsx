import React from "react";
import JobCard from "./JobCard";
import { RefreshCw } from "lucide-react";

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

interface JobListProps {
  jobs: Job[];
  loading: boolean;
}

const JobList: React.FC<JobListProps> = ({ jobs, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
        <p className="text-gray-500">Loading jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">
          No jobs found matching your filters.
        </p>
        <p className="text-gray-400">
          Try scraping new jobs or adjusting your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};

export default JobList;
