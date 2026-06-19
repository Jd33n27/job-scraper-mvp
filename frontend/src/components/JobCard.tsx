import React, { useState } from "react";
import { MapPin, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import ApplyButton from "./ApplyButton";
import SalaryDisplay from "./SalaryDisplay";
import MatchScore from "./MatchScore";
import JobDetailModal from "./JobDetailModal";

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

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-5">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
              {job.source}
            </span>
            <span className="text-xs font-medium text-gray-400">
              {new Date(job.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {job.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
            <span className="font-bold text-gray-800">{job.company}</span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="w-4 h-4 text-blue-500" />
              {job.location || "Remote"}
            </span>
            <SalaryDisplay min={job.salary_min} max={job.salary_max} compact />
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 min-w-35">
          {job.match ? (
            <MatchScore score={job.match.score} size="lg" />
          ) : job.ai_score > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
              {job.ai_score}% AI Fit
            </div>
          ) : null}
        </div>
      </div>

      {job.match && (
        <div className="flex flex-wrap gap-2">
          {(job.match.matched_skills || []).slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-100"
            >
              <CheckCircle2 className="w-3 h-3" />
              {skill}
            </span>
          ))}
          {(job.match.missing_skills || []).slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs font-medium rounded-md border border-gray-100"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {job.ai_reasoning && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
          <p className="text-sm text-gray-700 leading-relaxed italic pl-2">
            <span className="font-black text-blue-600/50 not-italic mr-2 text-xs tracking-tighter uppercase">
              Match Logic:
            </span>
            "{job.ai_reasoning}"
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors underline decoration-blue-200 decoration-2 underline-offset-4 cursor-pointer"
          >
            Job Details
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {job.supports_auto_apply && (
          <ApplyButton jobId={job.id} applicationId={job.application_id} />
        )}
      </div>

      <JobDetailModal
        job={job}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default JobCard;
