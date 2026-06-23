import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Terminal,
  Cpu,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "../config";

interface LogEvent {
  timestamp: string;
  level: "info" | "warn" | "error" | string;
  message: string;
}

interface TracebackDetails {
  id: number;
  job_title: string;
  company: string;
  status: string;
  created_at: string;
  updated_at: string;
  logs?: LogEvent[] | string[] | null;
}

export default function Traceback() {
  const { appId } = useParams<{ appId: string }>();
  const [data, setData] = useState<TracebackDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTraceback = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch automation traceback logs:", error);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchTraceback();
  }, [fetchTraceback]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
      case "success":
      case "completed":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "failed":
      case "error":
        return "bg-rose-500/10 text-rose-300 border-rose-500/20";
      default:
        return "bg-violet-500/10 text-violet-300 border-violet-500/20";
    }
  };

  return (
    <div className="h-full overflow-y-auto w-full flex justify-center bg-slate-950 text-slate-200">
      {/* Central Timeline Container */}
      <main className="w-full max-w-2xl border-x border-white/10 min-h-full bg-black/20 backdrop-blur-md flex flex-col">
        {/* Navigation Sticky Header */}
        <header className="sticky top-0 z-20 bg-slate-950/70 backdrop-blur-xl border-b border-white/10 p-5 flex items-center justify-between">
          <Link
            to="/applications"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Log
          </Link>

          <button
            onClick={fetchTraceback}
            disabled={loading}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`}
            />
          </button>
        </header>

        {/* Content Container */}
        <div className="flex flex-col flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-sm font-medium text-slate-400">
                Compiling engine telemetry...
              </span>
            </div>
          ) : data ? (
            <div className="flex flex-col">
              {/* Meta Section - Flat, Separated by Bottom Border */}
              <div className="border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(data.status)}`}
                  >
                    {data.status}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    ID: #{data.id}
                  </span>
                </div>

                <h1 className="text-xl font-bold text-slate-100 leading-snug">
                  {data.job_title}
                </h1>
                <p className="text-sm font-semibold text-slate-400 mt-1">
                  {data.company}
                </p>

                <div className="flex items-center gap-2 mt-4 text-[11px] font-mono text-slate-500">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>
                    Initialized: {new Date(data.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Terminal Section - Flat Container Layout */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Agent Action Stream
                  </h2>
                </div>

                {/* Automation Log Terminal Wrapper */}
                <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-3 shadow-inner min-h-75">
                  {data.logs && data.logs.length > 0 ? (
                    (data.logs as any[]).map((log, index) => {
                      const isStructured =
                        typeof log === "object" && log !== null;
                      const msg = isStructured ? log.message : String(log);
                      const stamp = isStructured ? log.timestamp : null;
                      const level = isStructured
                        ? String(log.level).toLowerCase()
                        : "info";

                      let levelColor = "text-cyan-400";
                      let icon = "::";
                      if (level === "error" || level === "failed") {
                        levelColor = "text-rose-400";
                        icon = "!!";
                      } else if (level === "warn" || level === "warning") {
                        levelColor = "text-amber-400";
                        icon = "ww";
                      }

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-2.5 leading-relaxed tracking-normal border-b border-white/3 pb-2 last:border-0 last:pb-0"
                        >
                          <span className="text-slate-600 shrink-0 select-none">
                            {icon}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            {stamp && (
                              <span className="text-[10px] text-slate-500">
                                [{new Date(stamp).toLocaleTimeString()}]
                              </span>
                            )}
                            <p className="text-slate-300">
                              <span
                                className={`font-bold mr-1.5 ${levelColor}`}
                              >
                                {level.toUpperCase()}
                              </span>
                              {msg}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
                      <Clock className="w-4 h-4 animate-pulse text-slate-600" />
                      <span>
                        Pipeline executing. Awaiting stdout buffer stream...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fatal Exception Fallback Banner */}
              {data.status.toLowerCase() === "failed" && (
                <div className="mx-6 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                      Automation Aborted
                    </h4>
                    <p className="text-xs text-rose-200/70 mt-1 leading-relaxed">
                      The execution sequence context was interrupted. Check DOM
                      targets or update structural parsing strategies.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <span className="text-sm font-medium text-slate-500">
                Data pipeline entity record not found.
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
