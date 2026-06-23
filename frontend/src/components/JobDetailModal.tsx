import { X, MapPin, Building2, DollarSign } from "lucide-react";
import type { Job } from "./JobCard";

interface JobDetailModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailModal = ({ job, isOpen, onClose }: JobDetailModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-10 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-white/10 p-5 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">
              {job.title}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-400" /> {job.company}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />{" "}
                {job.location || "Remote"}
              </span>
              {(job.salary_min ?? 0) > 0 && (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <DollarSign className="w-4 h-4" />{" "}
                  {(job.salary_min ?? 0) / 1000}k+
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-slate-300 space-y-6">
          <section>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
              About the Role
            </h3>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {job.description}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
