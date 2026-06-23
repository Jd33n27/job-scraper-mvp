import { useState, useEffect } from "react";
import JobCard, { type Job } from "../components/JobCard";
import FilterBar from "../components/FilterBar";
import { RefreshCw, DownloadCloud } from "lucide-react";
import { API_BASE_URL } from "../config";

interface HomeProps {
  sharedJobs: Job[];
  setSharedJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Home({
  sharedJobs,
  setSharedJobs,
  isLoaded,
  setIsLoaded,
}: HomeProps) {
  const [loading, setLoading] = useState(!isLoaded);
  const [isScraping, setIsScraping] = useState(false);

  const fetchJobs = async (queryString = "") => {
    if (sharedJobs.length === 0) setLoading(true);
    try {
      const endpoint = queryString
        ? `${API_BASE_URL}/jobs/filter?${queryString}`
        : `${API_BASE_URL}/jobs`;
      const response = await fetch(endpoint);
      const data = await response.json();
      setSharedJobs(data || []);
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      fetchJobs();
    }
  }, [isLoaded]);

  const triggerScrape = async () => {
    setIsScraping(true);
    try {
      await fetch(`${API_BASE_URL}/scrape`, { method: "POST" });
      setTimeout(() => {
        fetchJobs();
        setIsScraping(false);
      }, 4000);
    } catch (error) {
      console.error("Failed to trigger scrape:", error);
      setIsScraping(false);
    }
  };

  const handleFilter = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.location) params.append("location", filters.location);
    if (filters.minSalary) params.append("minSalary", filters.minSalary);
    if (filters.supportsAutoApply) params.append("supportsAutoApply", "true");
    fetchJobs(params.toString());
  };

  return (
    <div className="h-full w-full flex bg-[#0f0d0c] overflow-hidden">
      {/* Left Grid Pane: Sidebar Controls */}
      <aside className="w-80 border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 bg-black/10">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Search Parameters
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal">
            Refine feed outputs or synchronize listing caches.
          </p>
        </div>

        <FilterBar onFilter={handleFilter} />

        <div className="pt-5 border-t border-white/10 flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Data Source Synchronization
          </h3>
          <button
            onClick={triggerScrape}
            disabled={isScraping}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-[0_0_15px_rgba(217,95,56,0.05)]"
          >
            <DownloadCloud
              className={`w-4 h-4 shrink-0 ${isScraping ? "animate-pulse" : ""}`}
            />
            {isScraping ? "Syncing Feed..." : "Synchronize Web Data"}
          </button>
        </div>
      </aside>

      {/* Right Grid Pane: Full Screen Table Matrix */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-8 py-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/5">
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-wide">
              Global Feed Matrix
            </h1>
            <p className="text-xs text-slate-400">
              Aggregated open roles from active scrapers
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
            {sharedJobs.length} active records
          </div>
        </header>

        {/* Matrix Header Row */}
        <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
          <div className="col-span-4">Role / Organization</div>
          <div className="col-span-3">Location & Base Salary</div>
          <div className="col-span-2">Alignment</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Matrix List Feed */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/10 bg-black/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-sm font-medium text-slate-400">
                Refreshing database matrix...
              </span>
            </div>
          ) : sharedJobs.length > 0 ? (
            sharedJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <span className="text-sm font-medium text-slate-400">
                No active listings matched the query parameters.
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
