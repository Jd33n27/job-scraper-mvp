import React, { useState } from "react";
import StatsDashboard from "../components/StatsDashboard";
import MatchAnalytics from "./MatchAnalytics";
import SystemHealth from "./SystemHealth";
import { BarChart3 } from "lucide-react";

const Stats: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "insights" | "system"
  >("overview");

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-slate-950 text-slate-200 relative z-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
                Analytics Hub
              </h1>
              <p className="text-slate-400 font-medium text-xs mt-0.5">
                Real-time tracking, AI scoring insights, and system logs.
              </p>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 border border-white/10 rounded-xl w-fit self-start md:self-center backdrop-blur-md">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "overview" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "insights" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "system" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              System
            </button>
          </div>
        </div>

        <div className="animate-fade-in bg-black/20 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          {activeTab === "overview" && <StatsDashboard />}
          {activeTab === "insights" && <MatchAnalytics />}
          {activeTab === "system" && <SystemHealth />}
        </div>
      </div>
    </div>
  );
};

export default Stats;
