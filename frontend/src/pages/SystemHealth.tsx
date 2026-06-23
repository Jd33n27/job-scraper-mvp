import { useQuery } from "@tanstack/react-query";
import { Cpu, Server, Activity, HardDrive, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../config";

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  uptime_seconds: number;
  active_routines: number;
  database_status: string;
}

export default function SystemHealth() {
  const { data: metrics, isLoading: loading } = useQuery<SystemMetrics>({
    queryKey: ["systemHealth"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error("Failed to fetch system telemetry");
      }
      return response.json();
    },
    refetchInterval: 10000,
  });

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        <span className="text-xs text-slate-500 font-mono">
          Connecting to system daemon...
        </span>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === "connected" ||
      status.toLowerCase() === "healthy"
      ? "text-emerald-400"
      : "text-rose-400";
  };

  return (
    <div className="space-y-8">
      {/* Structural Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-cyan-400 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              CPU Target
            </p>
            <h3 className="text-xl font-mono font-bold text-slate-100">
              {metrics.cpu_usage.toFixed(1)}%
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-violet-400 border border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.05)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              RAM Pool
            </p>
            <h3 className="text-xl font-mono font-bold text-slate-100">
              {metrics.memory_usage.toFixed(1)}%
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Disk Alloc
            </p>
            <h3 className="text-xl font-mono font-bold text-slate-100">
              {metrics.disk_usage.toFixed(1)}%
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-amber-400 border border-white/10 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Active Go Routines
            </p>
            <h3 className="text-xl font-mono font-bold text-slate-100">
              {metrics.active_routines}
            </h3>
          </div>
        </div>
      </div>

      {/* Flat Data Rows - Replaces old cards */}
      <div className="space-y-4 font-sans text-sm">
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-slate-400 font-medium">
            Database Core Pipeline
          </span>
          <span
            className={`font-mono font-bold uppercase tracking-wider ${getStatusColor(metrics.database_status)}`}
          >
            {metrics.database_status}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-slate-400 font-medium">
            Scraper Core Uptime
          </span>
          <span className="font-mono font-bold text-slate-200">
            {formatUptime(metrics.uptime_seconds)}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-slate-400 font-medium">
            Cron Scheduler Vector
          </span>
          <span className="font-mono font-bold text-cyan-400">
            Active (6hr Loop)
          </span>
        </div>
      </div>
    </div>
  );
}
