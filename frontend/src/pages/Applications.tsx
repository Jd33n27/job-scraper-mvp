import React, { useEffect, useState } from "react";
import { Briefcase, Calendar, Clock, ChevronRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";

interface Application {
  id: number;
  job_id: number;
  status: string;
  method: string;
  applied_at: string;
  job_title: string;
  job_company: string;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied_auto":
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "manual_review":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "auto_applied":
        return "🤖 Auto Applied";
      case "auto_filled":
        return "✍️ Auto Filled";
      case "manual":
        return "👤 Manual";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Clock className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Application History
          </h1>
          <p className="text-gray-500 mt-1">
            Trace back your footsteps and track your progress.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            {applications.length} Total
          </span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">
            No applications yet
          </h3>
          <p className="text-gray-500 mt-2">
            Start applying to jobs to see your history here.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Job & Company
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Method
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Applied On
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {app.job_title}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {app.job_company}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        {getMethodLabel(app.method)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}
                      >
                        {app.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        to={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Traceback
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
