import React, { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import { Sparkles, Loader2 } from "lucide-react";

import { API_BASE_URL } from "../config";

const RecommendedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/jobs/recommended`,
        );
        const data = await response.json();

        if (response.status === 404 || data.error) {
          setJobs([]);
          return;
        }

        // Sort by match score descending
        const sorted = data.sort(
          (a: any, b: any) => b.match.score - a.match.score,
        );
        setJobs(sorted);
      } catch (error) {
        console.error("Error fetching recommended jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">
          Analyzing matches for your profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Recommended For You
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Top {jobs.length} jobs matched specifically against your CV skills
            and experience.
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-100 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-xl font-bold text-gray-900">
              Personalize Your Search
            </h3>
            <p className="text-gray-400 mt-2">
              Upload your CV to see AI-powered job matches ranked by your
              specific skills.
            </p>
          </div>
          <button
            onClick={() =>
              (window as any).dispatchEvent(new CustomEvent("open-cv-upload"))
            }
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Upload CV Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
