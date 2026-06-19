import React from "react";
import { X, MapPin, ExternalLink, Briefcase, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import ApplyButton from "./ApplyButton";
import SalaryDisplay from "./SalaryDisplay";

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

interface JobDetailModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start gap-4 bg-slate-50/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                {job.source}
              </span>
              <span className="text-xs font-medium text-gray-400">
                Posted on {new Date(job.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {job.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 text-sm">
              <span className="font-bold text-gray-800">{job.company}</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-500" />
                {job.location || "Remote"}
              </span>
              <SalaryDisplay min={job.salary_min} max={job.salary_max} compact />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Match Analysis Section */}
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-5 rounded-2xl border border-blue-100/50 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">CV Match Profile</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-extrabold shadow-sm">
                {job.match ? `${job.match.score}% Match` : `${job.ai_score || 0}% AI Fit`}
              </div>
            </div>

            {/* Match details / reasoning */}
            {(job.match?.details || job.ai_reasoning) && (
              <div className="text-sm text-gray-700 leading-relaxed bg-white/80 p-4 rounded-xl border border-blue-50 shadow-sm">
                <span className="font-bold text-blue-700 block mb-1">Matching Insight:</span>
                "{job.match?.details || job.ai_reasoning}"
              </div>
            )}

            {/* Skills match lists */}
            {job.match && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wider block">Matched Skills ({job.match.matched_skills.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.match.matched_skills.length > 0 ? (
                      job.match.matched_skills.map((skill) => (
                        <span key={skill} className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded border border-green-100">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">None matched</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Missing Skills ({job.match.missing_skills.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.match.missing_skills.length > 0 ? (
                      job.match.missing_skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs font-medium rounded border border-gray-200/50">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-green-700 font-semibold italic flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Matches all skills!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job Description Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">Job Description</h3>
            <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line bg-slate-50/30 p-5 rounded-2xl border border-gray-100">
              {job.description || "No full description available for this job posting."}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-slate-50/50">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Apply on Source Website
            <ExternalLink className="w-4 h-4" />
          </a>

          {job.supports_auto_apply && (
            <ApplyButton jobId={job.id} applicationId={job.application_id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
