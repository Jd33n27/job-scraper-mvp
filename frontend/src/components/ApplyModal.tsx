import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  CheckCircle,
  Info,
  Loader2,
  Send,
} from "lucide-react";
import type { UserProfile } from "../utils/profile";
import { API_BASE_URL } from "../config";

interface ApplicationPreview {
  job_id: number;
  title: string;
  company: string;
  requirements: string[];
  user_data: UserProfile;
}

interface ApplyModalProps {
  jobId: number;
  onClose: () => void;
  onConfirm: (data: UserProfile) => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  jobId,
  onClose,
  onConfirm,
}) => {
  const [preview, setPreview] = useState<ApplicationPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/jobs/${jobId}/preview`)
      .then((res) => res.json())
      .then((data) => {
        setPreview(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl flex flex-col items-center shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
          <p className="text-slate-400 font-medium">
            Preparing application preview...
          </p>
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-slate-100">
            Application Preview
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Job Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Target Role
            </h4>
            <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
              <p className="text-lg font-bold text-cyan-400">{preview.title}</p>
              <p className="text-cyan-200/70 font-medium">{preview.company}</p>
            </div>
          </div>

          {/* Requirements Check */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Requirements Found
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {preview.requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Data to be sent */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Your Data Payload
            </h4>
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-slate-200">
                    {preview.user_data.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-slate-200">
                    {preview.user_data.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-slate-200">
                    {preview.user_data.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(preview.user_data)}
            className="px-6 py-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Inject Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
