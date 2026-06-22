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
    <div className="py-6 border-b border-brand-border flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-brand-border bg-brand-cream text-brand-muted-text">
              {job.source}
            </span>
            <span className="text-xs font-semibold text-brand-muted-text">
              {new Date(job.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <h2 className="text-xl font-serif font-black text-brand-forest tracking-tight leading-snug">
            {job.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-brand-muted-text font-medium text-xs">
            <span className="font-bold text-brand-forest text-sm">{job.company}</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-terracotta/80" />
              {job.location || "Remote"}
            </span>
            <SalaryDisplay min={job.salary_min} max={job.salary_max} compact />
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 min-w-35">
          {job.match ? (
            <MatchScore score={job.match.score} size="lg" />
          ) : job.ai_score > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-brand-sage text-brand-forest border-brand-border text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
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
              className="flex items-center gap-1 px-2.5 py-0.5 bg-[#EBF7EE] text-[#1E5D2F] text-[10px] font-sans font-bold rounded-md border border-[#C5ECD0]"
            >
              <CheckCircle2 className="w-3 h-3" />
              {skill}
            </span>
          ))}
          {(job.match.missing_skills || []).slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 bg-brand-cream text-brand-muted-text text-[10px] font-sans font-semibold rounded-md border border-brand-border"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {job.ai_reasoning && (
        <div className="py-3 border-t border-b border-brand-border/40 relative overflow-hidden group">
          <div className="absolute left-0 top-0 w-1 h-full bg-brand-terracotta/25 group-hover:bg-brand-terracotta transition-colors" />
          <p className="text-xs text-brand-muted-text leading-relaxed italic pl-2">
            <span className="font-bold text-brand-forest not-italic mr-2 text-[10px] tracking-wider uppercase font-sans">
              Match Logic:
            </span>
            "{job.ai_reasoning}"
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-brand-forest hover:text-brand-terracotta transition-colors underline decoration-brand-border decoration-2 underline-offset-4 cursor-pointer bg-transparent border-0 outline-none"
          >
            Job Details
            <ExternalLink className="w-3.5 h-3.5" />
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
