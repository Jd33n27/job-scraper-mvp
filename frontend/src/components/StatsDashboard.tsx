import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, Briefcase, CheckCircle, Building, Calendar, Award } from "lucide-react";
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
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStats();
    }, 0);

    const interval = setInterval(fetchStats, 300000); // 5 minutes

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchStats]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-terracotta"></div>
      </div>
    );
  }

  const COLORS = ["#1A3026", "#C86A51", "#4A5F56", "#E8EFE9", "#DCD5CB"];

  return (
    <div className="space-y-8 pb-12">
      {/* Metrics Row (Flat dividers, no card backgrounds) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 border-b border-brand-border/60 pb-8">
        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 bg-brand-sage rounded-xl flex items-center justify-center text-brand-forest flex-shrink-0 border border-brand-border/40">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-muted-text uppercase tracking-wider">Jobs Today</p>
            <h3 className="text-xl font-bold text-brand-forest mt-0.5">{stats.jobs_today}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center text-brand-terracotta flex-shrink-0 border border-brand-border/40">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-muted-text uppercase tracking-wider">Jobs Week</p>
            <h3 className="text-xl font-bold text-brand-forest mt-0.5">{stats.jobs_week}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 bg-[#EBF7EE] rounded-xl flex items-center justify-center text-[#1E5D2F] flex-shrink-0 border border-[#C5ECD0]/40">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-muted-text uppercase tracking-wider">Apps Today</p>
            <h3 className="text-xl font-bold text-brand-forest mt-0.5">{stats.applications_today}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 bg-[#FFF9E6] rounded-xl flex items-center justify-center text-[#B06000] flex-shrink-0 border border-[#FCE8B2]/40">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-muted-text uppercase tracking-wider">Total Apps</p>
            <h3 className="text-xl font-bold text-brand-forest mt-0.5">{stats.total_applications}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 bg-[#FDF2ED] rounded-xl flex items-center justify-center text-[#A64115] flex-shrink-0 border border-[#FAD6C5]/40">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-muted-text uppercase tracking-wider">Success Rate</p>
            <h3 className="text-xl font-bold text-brand-forest mt-0.5">{stats.success_rate.toFixed(1)}%</h3>
          </div>
        </div>
      </div>

      {/* Daily Trends (Line Charts, Flat Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-brand-border/60 pb-8">
        <div className="py-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-brand-terracotta" />
            <h3 className="text-base font-serif font-black text-brand-forest">Jobs Scraped (7 Days)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.jobs_daily} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FAF7F2" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#4A5F56" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#4A5F56" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #DCD5CB", backgroundColor: "#FAF7F2", boxShadow: "0 4px 15px rgba(26, 48, 38, 0.05)" }} />
                <Line type="monotone" dataKey="count" stroke="#1A3026" strokeWidth={3} dot={{ fill: "#1A3026", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="py-2">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-4 h-4 text-[#1E5D2F]" />
            <h3 className="text-base font-serif font-black text-brand-forest">Applications Submitted (7 Days)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.applications_daily} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FAF7F2" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#4A5F56" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#4A5F56" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #DCD5CB", backgroundColor: "#FAF7F2", boxShadow: "0 4px 15px rgba(26, 48, 38, 0.05)" }} />
                <Line type="monotone" dataKey="count" stroke="#C86A51" strokeWidth={3} dot={{ fill: "#C86A51", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Companies (Flat Layout) */}
      <div className="py-2 border-b border-brand-border/60 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Building className="w-4 h-4 text-brand-muted-text" />
          <h3 className="text-base font-serif font-black text-brand-forest">Top Companies</h3>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.top_companies}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#FAF7F2"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="company"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#14221D" }}
                width={100}
              />
              <Tooltip
                cursor={{ fill: "rgba(232, 239, 233, 0.3)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #DCD5CB",
                  backgroundColor: "#FAF7F2",
                  boxShadow: "0 4px 15px rgba(26, 48, 38, 0.05)",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                {(stats.top_companies || []).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Stats Section */}
      <AdvancedStats
        bySource={stats.by_source || []}
        byLocation={stats.by_location || []}
      />
    </div>
  );
};

export default StatsDashboard;
