import React, { useState, useEffect } from "react";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Server,
  CheckCircle2,
} from "lucide-react";

interface SystemError {
  id: number;
  component: string;
  error_message: string;
  severity: string;
  created_at: string;
}

interface ScraperHealth {
  source: string;
  last_run: string;
  status: string;
  jobs_stored: number;
}

interface HealthData {
  status: string;
  uptime: string;
  total_jobs: number;
  gemini_usage: number;
  recent_errors: SystemError[];
  scraper_health: ScraperHealth[];
}

const SystemHealth: React.FC = () => {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/system/health");
        const healthData = await response.json();
        setData(healthData);
      } catch (error) {
        console.error("Error fetching system health:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-600" />
            System Monitor
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Real-time infrastructure and AI usage tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 font-bold">
          <ShieldCheck className="w-5 h-5" />
          {data.status}
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Uptime
          </p>
          <h3 className="text-xl font-black text-gray-900 truncate">
            {data.uptime.split(".")[0]}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Gemini Requests (24h)
          </p>
          <h3 className="text-3xl font-black text-blue-600">
            {data.gemini_usage}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Total Jobs Stored
          </p>
          <h3 className="text-3xl font-black text-gray-900">
            {data.total_jobs}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Recent Errors
          </p>
          <h3
            className={`text-3xl font-black ${data.recent_errors?.length > 0 ? "text-red-500" : "text-green-500"}`}
          >
            {data.recent_errors?.length || 0}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Scraper Status */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-800">Scraper Nodes</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Last Run</th>
                  <th className="px-6 py-4">Stored</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.scraper_health?.map((s) => (
                  <tr
                    key={s.source}
                    className="text-sm hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {s.source}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(s.last_run).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 font-medium">{s.jobs_stored}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                          s.status === "Healthy"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Error Log */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-gray-800">
              Recent Incident Log
            </h2>
          </div>
          <div className="space-y-3">
            {data.recent_errors?.length > 0 ? (
              data.recent_errors.map((err) => (
                <div
                  key={err.id}
                  className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-red-500 uppercase">
                      {err.component}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(err.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    {err.error_message}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-green-50 p-8 rounded-2xl border border-green-100 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-green-700 font-bold">
                  No recent incidents reported.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Operational Best Practices */}
      <section className="bg-gray-900 text-white p-8 md:p-12 rounded-3xl relative overflow-hidden">
        <Zap className="absolute right-5 top-5 w-64 h-64 text-white/5 rotate-12" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-6">Operational Excellence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">
                Efficiency Checklist
              </h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>
                    Monitor **Gemini Usage** daily to avoid unexpected API
                    costs.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>
                    Ensure **Scraper Nodes** show 'Healthy'; 'Stale' indicates a
                    broken selector.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>
                    Keep your **CV profile** updated to maintain high match
                    accuracy.
                  </span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-purple-400 font-bold uppercase tracking-widest text-xs">
                Things to Watch Out For
              </h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>
                    High frequency of **'Gemini-Batch'** errors suggests rate
                    limiting.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>
                    Drop in **Jobs Stored** means site structures have likely
                    changed.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>
                    Verify **Database Connections** if system status fluctuates.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SystemHealth;
