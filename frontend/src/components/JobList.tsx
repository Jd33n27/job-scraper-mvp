import React from "react";
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
  onSelect: (job: Job) => void;
  selectedJobId?: number | null;
}

const JobList: React.FC<JobListProps> = ({ jobs, loading, onSelect, selectedJobId }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 border border-gray-300 bg-white">
        <RefreshCw className="w-4 h-4 animate-spin text-gray-600 mr-2" />
        <span className="font-mono text-xs">Loading items...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-8 border border-dashed border-gray-300 text-center bg-white font-mono text-xs text-gray-500">
        No records found. Adjust index parameters.
      </div>
    );
  }

  return (
    <div className="border border-gray-400 bg-white h-full overflow-auto panel-inset">
      <table className="finder-table font-mono text-xs">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>Source</th>
            <th>Job Title</th>
            <th>Company</th>
            <th style={{ width: "50px" }}>Match</th>
            <th style={{ width: "60px" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const score = job.match ? job.match.score : job.ai_score;
            const dateStr = new Date(job.created_at).toLocaleDateString(undefined, {
              month: "2-digit",
              day: "2-digit",
            });
            const isSelected = selectedJobId === job.id;
            return (
              <tr
                key={job.id}
                onClick={() => onSelect(job)}
                className={isSelected ? "selected" : ""}
              >
                <td title={job.source}>{job.source}</td>
                <td className="font-bold" title={job.title}>{job.title}</td>
                <td title={job.company}>{job.company}</td>
                <td>{score > 0 ? `${score}%` : "-"}</td>
                <td>{dateStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default JobList;
