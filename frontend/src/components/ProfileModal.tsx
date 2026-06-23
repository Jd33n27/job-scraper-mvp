import React, { useState } from "react";
import { X, Save} from "lucide-react";
import type { UserProfile } from "../utils/profile";

interface ProfileModalProps {
  onClose: () => void;
  onSave: (data: UserProfile) => void;
  initialData?: UserProfile;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    skills: initialData?.skills || "",
    bio: initialData?.bio || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-slate-100">Identity Config</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar"
        >
          <p className="text-sm text-slate-400 mb-4">
            This identity is injected into the AI matcher and auto-fill agents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Full Name
              </label>
              <div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-[#faf7f2] border border-[#292523]/25 rounded-xl focus:border-cyan-500 outline-none transition-all text-[#171514] placeholder-slate-500 font-medium"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email
              </label>
              <div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-[#faf7f2] border border-[#292523]/25 rounded-xl focus:border-cyan-500 outline-none transition-all text-[#171514] placeholder-slate-500 font-medium"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Phone
            </label>
            <div>
              <input
                type="tel"
                required
                className="w-full pl-10 pr-4 py-2 bg-[#faf7f2] border border-[#292523]/25 rounded-xl focus:border-cyan-500 outline-none transition-all text-[#171514] placeholder-slate-500 font-medium"
                placeholder="123-456-7890"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Skills (CSV)
            </label>
            <div>
              <textarea
                className="w-full pl-10 pr-4 py-2 bg-[#faf7f2] border border-[#292523]/25 rounded-xl focus:border-cyan-500 outline-none transition-all min-h-20 text-[#171514] placeholder-slate-500 resize-none font-medium"
                placeholder="React, TypeScript, Go..."
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Bio / Context
            </label>

            <div>
              <textarea
                className="w-full pl-10 pr-4 py-2 bg-[#faf7f2] border border-[#292523]/25 rounded-xl focus:border-cyan-500 outline-none transition-all min-h-30 text-[#171514] placeholder-slate-500 resize-none font-medium"
                placeholder="Software engineer focused on scalable systems..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Identity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
