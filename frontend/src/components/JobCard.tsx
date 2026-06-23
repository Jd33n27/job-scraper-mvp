import { useState } from "react";
import { MapPin, ExternalLink, Sparkles } from "lucide-react";
import ApplyButton from "./ApplyButton";
import JobDetailModal from "./JobDetailModal";

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number | null;
  source: string;
  created_at: string;
  supports_auto_apply?: boolean;
  application_id?: number | null;
  match?: { score: number; matched_skills?: string[] };
  ai_score?: number;
}

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <article 
        onClick={() => setIsModalOpen(true)}
        className="grid grid-cols-12 gap-4 px-8 py-3.5 items-center border-b border-white/15 hover:bg-white/5 transition-all duration-150 cursor-pointer group text-slate-300 hover:text-slate-100"
      >
        {/* Col-span 4: Title & Company */}
        <div className="col-span-4 flex flex-col gap-0.5 pr-2">
          <h2 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors leading-tight line-clamp-1">
            {job.title}
          </h2>
          <span className="text-xs text-slate-400 font-medium">{job.company}</span>
        </div>

        {/* Col-span 3: Location & Salary */}
        <div className="col-span-3 flex flex-col gap-0.5 pr-2">
          <span className="text-xs text-slate-300 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500 shrink-0" />
            <span className="line-clamp-1">{job.location || "Remote"}</span>
          </span>
          {(job.salary_min ?? 0) > 0 ? (
            <span className="text-[11px] font-bold text-emerald-400/80">
              ${(job.salary_min ?? 0) / 1000}k+
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 italic">No salary posted</span>
          )}
        </div>

        {/* Col-span 2: Match Rating */}
        <div className="col-span-2 flex items-center pr-2">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-violet-400 shrink-0" />
            <span>{job.match?.score || job.ai_score || 0}%</span>
          </div>
        </div>

        {/* Col-span 2: Source & Date */}
        <div className="col-span-2 flex flex-col gap-0.5 pr-2">
          <span className="text-xs font-semibold text-slate-400">{job.source}</span>
          <span className="text-[10px] text-slate-500">
            {new Date(job.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Col-span 1: Action (Auto-Apply / Details Link) */}
        <div 
          className="col-span-1 flex items-center justify-end gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {job.supports_auto_apply && (
            <ApplyButton jobId={job.id} applicationId={job.application_id} />
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="View Details"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </article>

      <JobDetailModal
        job={job}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default JobCard;
