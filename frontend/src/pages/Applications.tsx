import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  History,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  TrendingUp,
} from "lucide-react";
import { API_BASE_URL } from "../config";

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  status: string;
  created_at: string;
  updated_at: string;
  error_message?: string | null;
}

export default function Applications() {
  const { data: applications = [], isLoading: loading, refetch, isRefetching } = useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/applications`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.applications || [];
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
      case "success":
      case "completed":
        return {
          badge:
            "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "failed":
      case "error":
        return {
          badge:
            "bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
      default: // pending, processing, active
        return {
          badge:
            "bg-violet-500/10 text-violet-300 border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]",
          icon: <Clock className="w-3.5 h-3.5 text-violet-400" />,
        };
    }
  };

  // Local stats aggregation
  const total = applications.length;
  const successful = applications.filter(app => {
    const s = app.status.toLowerCase();
    return s === "submitted" || s === "success" || s === "completed";
  }).length;
  const failed = applications.filter(app => {
    const s = app.status.toLowerCase();
    return s === "failed" || s === "error";
  }).length;
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  return (
    <div className="h-full w-full flex bg-[#0f0d0c] overflow-hidden text-slate-200">
      {/* Left Grid Pane: Sidebar Controls */}
      <aside className="w-80 border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 bg-black/10">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pipeline Analytics
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal">
            Real-time tracking metrics of automated applier jobs.
          </p>
        </div>

        {/* Local aggregation metrics */}
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Total Applications
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">{total}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
              <div className="text-[9px] font-bold uppercase text-slate-500">Success</div>
              <div className="text-base font-bold font-mono text-emerald-400">{successful}</div>
            </div>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
              <div className="text-[9px] font-bold uppercase text-slate-500">Failed</div>
              <div className="text-base font-bold font-mono text-rose-400">{failed}</div>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Success Rate
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400">{successRate}%</div>
            </div>
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Legends</div>
          <div className="text-[11px] space-y-2 text-slate-400 leading-normal">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Submitted / Success: Autocomplete filled & submitted.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0"></span>
              <span>Pending / Processing: Awaiting form detection agent.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
              <span>Failed / Error: Blockers triggered (Captcha, etc.).</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Grid Pane: Full Screen Table Matrix */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-8 py-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center border border-violet-500/20">
              <History className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-wide">
                Application Log
              </h1>
              <p className="text-xs text-slate-400">
                Audit trail of Puppeteer browser submissions
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={loading || isRefetching}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading || isRefetching ? "animate-spin text-cyan-400" : ""}`}
            />
          </button>
        </header>

        {/* Matrix Header Row */}
        <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
          <div className="col-span-5">Role & Company</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-3">Applied Timestamp</div>
          <div className="col-span-1 text-right">Logs</div>
        </div>

        {/* Matrix List Feed */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/10 bg-black/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-sm font-medium text-slate-400">
                Loading audit logs...
              </span>
            </div>
          ) : applications.length > 0 ? (
            applications.map((app) => {
              const statusStyle = getStatusStyle(app.status);
              return (
                <div
                  key={app.id}
                  className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-white/5 transition-all duration-150 text-slate-300 hover:text-slate-100"
                >
                  {/* Col-span 5: Title & Company */}
                  <div className="col-span-5 flex flex-col gap-0.5 pr-2">
                    <h2 className="text-sm font-semibold text-slate-200 leading-tight line-clamp-1">
                      {app.job_title}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">{app.company}</span>
                  </div>

                  {/* Col-span 3: Status Badge */}
                  <div className="col-span-3 flex items-center pr-2">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${statusStyle.badge}`}
                    >
                      {statusStyle.icon}
                      {app.status}
                    </span>
                  </div>

                  {/* Col-span 3: Applied Date */}
                  <div className="col-span-3 text-xs text-slate-400">
                    {new Date(app.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Col-span 1: Action Logs link */}
                  <div className="col-span-1 flex items-center justify-end">
                    <Link
                      to={`/applications/${app.id}`}
                      className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                      title="View Traceback Trace"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <span className="text-sm font-medium text-slate-500">
                No pipeline applications recorded yet.
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
