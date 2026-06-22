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
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-brand-cream">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-forest rounded-xl flex items-center justify-center border border-brand-border-dark shadow-sm">
              <BarChart3 className="w-5 h-5 text-brand-sage" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-black text-brand-forest tracking-tight">
                Analytics Hub
              </h1>
              <p className="text-brand-muted-text font-semibold text-xs mt-0.5">
                Real-time tracking, AI scoring insights, and system logs.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-brand-panel-light p-1 border border-brand-border rounded-xl w-fit self-start md:self-center">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-brand-forest text-brand-light-text shadow-sm"
                  : "text-brand-muted-text hover:text-brand-forest"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "insights"
                  ? "bg-brand-forest text-brand-light-text shadow-sm"
                  : "text-brand-muted-text hover:text-brand-forest"
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "system"
                  ? "bg-brand-forest text-brand-light-text shadow-sm"
                  : "text-brand-muted-text hover:text-brand-forest"
              }`}
            >
              System
            </button>
          </div>
        </div>

        <div className="animate-fade-in">
          {activeTab === "overview" && <StatsDashboard />}
          {activeTab === "insights" && <MatchAnalytics />}
          {activeTab === "system" && <SystemHealth />}
        </div>
      </div>
    </div>
  );
};

export default Stats;
