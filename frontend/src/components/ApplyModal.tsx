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
import { type UserProfile } from "../utils/profile";

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
    fetch(`http://localhost:8080/api/jobs/${jobId}/preview`)
      .then((res) => res.json())
      .then((data) => {
        setPreview(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600">Preparing preview...</p>
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">
            Application Preview
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Job Summary */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Target Job
            </h4>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-lg font-bold text-blue-900">{preview.title}</p>
              <p className="text-blue-700 font-medium">{preview.company}</p>
            </div>
          </div>

          {/* Requirements Check */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Requirements Found
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {preview.requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Data to be sent */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Your Application Data
            </h4>
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {preview.user_data.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {preview.user_data.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Phone Number
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {preview.user_data.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Process Breakdown */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <h4 className="text-sm font-bold text-amber-900 mb-2">
              How it works:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-amber-800">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>Our bot scans the job page for application fields.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-amber-800">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>
                  Your data above is automatically filled into the form.
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-amber-800">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>A receipt is generated for your records.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(preview.user_data)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            Confirm & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
