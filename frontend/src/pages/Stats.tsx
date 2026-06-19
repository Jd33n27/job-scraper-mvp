import React, { useState } from "react";
import StatsDashboard from "../components/StatsDashboard";
import MatchAnalytics from "./MatchAnalytics";
import SystemHealth from "./SystemHealth";
import { BarChart3, LineChart, Activity } from "lucide-react";

const Stats: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "insights" | "system"
  >("overview");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 font-medium">
              Real-time performance and system health.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit self-start md:self-center">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
              activeTab === "overview"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
              activeTab === "insights"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
              activeTab === "system"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            System
          </button>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {activeTab === "overview" && <StatsDashboard />}
        {activeTab === "insights" && <MatchAnalytics />}
        {activeTab === "system" && <SystemHealth />}
      </div>
    </div>
  );
};

export default Stats;
