import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Briefcase,
  CheckCircle,
  Calendar,
  Award,
} from "lucide-react";
import AdvancedStats from "./AdvancedStats";
import { API_BASE_URL } from "../config";

interface CompanyStat {
  company: string;
  count: number;
}
interface GenericStat {
  name: string;
  count: number;
}
interface DailyStat {
  date: string;
  count: number;
}
interface StatsData {
  jobs_today: number;
  jobs_week: number;
  applications_today: number;
  total_applications: number;
  success_rate: number;
  top_companies: CompanyStat[];
  by_source: GenericStat[];
  by_location: GenericStat[];
  jobs_daily: DailyStat[];
  applications_daily: DailyStat[];
}

const StatsDashboard: React.FC = () => {
  const { data: stats, isLoading: loading } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
    refetchInterval: 300000,
  });

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const gridColor = "rgba(255,255,255,0.05)";
  const textColor = "#94a3b8";

  return (
    <div className="space-y-8 pb-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-cyan-400 border border-white/10">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Jobs Today
            </p>
            <h3 className="text-xl font-bold text-slate-100">
              {stats.jobs_today}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-violet-400 border border-white/10">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Jobs Week
            </p>
            <h3 className="text-xl font-bold text-slate-100">
              {stats.jobs_week}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Apps Today
            </p>
            <h3 className="text-xl font-bold text-slate-100">
              {stats.applications_today}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Apps
            </p>
            <h3 className="text-xl font-bold text-slate-100">
              {stats.total_applications}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Success Rate
            </p>
            <h3 className="text-xl font-bold text-slate-100">
              {stats.success_rate.toFixed(1)}%
            </h3>
          </div>
        </div>
      </div>

      {/* Daily Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">
              Jobs Scraped (7 Days)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart
                data={stats.jobs_daily}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#0f172a",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ fill: "#22d3ee", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              Applications (7 Days)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart
                data={stats.applications_daily}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#0f172a",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <AdvancedStats
        bySource={stats.by_source || []}
        byLocation={stats.by_location || []}
      />
    </div>
  );
};

export default StatsDashboard;
