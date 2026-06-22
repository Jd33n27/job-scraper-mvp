import React from "react";
import { RefreshCw, MapPin } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-terracotta" />
        <span className="text-xs text-brand-muted-text font-medium">Fetching catalog entries...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6 border border-dashed border-brand-border rounded-2xl bg-brand-cream/30 text-center">
        <span className="text-xs text-brand-muted-text font-medium">
          No records found. Adjust filter criteria.
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col gap-3 pr-1.5 no-scrollbar">
      {jobs.map((job) => {
        const score = job.match ? job.match.score : job.ai_score;
        const isSelected = selectedJobId === job.id;
        
        // Dynamic badge color based on match score
        let scoreBg = "bg-brand-sage border-brand-border text-brand-forest";
        if (score >= 80) {
          scoreBg = "bg-[#EBF7EE] border-[#C5ECD0] text-[#1E5D2F]";
        } else if (score >= 60) {
          scoreBg = "bg-[#FFF9E6] border-[#FCE8B2] text-[#B06000]";
        } else if (score > 0) {
          scoreBg = "bg-[#FDF2ED] border-[#FAD6C5] text-[#A64115]";
        }

        return (
          <div
            key={job.id}
            onClick={() => onSelect(job)}
            className={`job-item flex items-center justify-between gap-4 border text-left p-3.5 transition-all duration-200 cursor-pointer ${
              isSelected 
                ? "bg-brand-sage/60 border-brand-forest shadow-sm ring-1 ring-brand-forest" 
                : "bg-white border-brand-border hover:border-brand-terracotta hover:bg-brand-cream/40"
            }`}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold text-brand-muted-text border border-brand-border/60 bg-brand-cream px-1.5 py-0.5 rounded">
                  {job.source}
                </span>
                <span className="text-[10px] text-brand-muted-text font-mono font-medium">
                  {new Date(job.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              
              <h4 className="font-serif font-black text-brand-forest text-xs leading-snug truncate mt-0.5" title={job.title}>
                {job.title}
              </h4>
              
              <div className="flex items-center gap-1.5 text-[11px] text-brand-muted-text font-medium truncate">
                <span className="truncate">{job.company}</span>
                {job.location && (
                  <>
                    <span>&bull;</span>
                    <span className="flex items-center text-[10px]">
                      <MapPin className="w-3 h-3 mr-0.5 inline-block text-brand-terracotta/70" />
                      {job.location}
                    </span>
                  </>
                )}
              </div>
            </div>

            {score > 0 && (
              <div className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full border text-[11px] font-mono font-black ${scoreBg}`}>
                {score}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default JobList;
