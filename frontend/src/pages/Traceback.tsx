import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  ExternalLink,
} from "lucide-react";

interface ApplicationTraceback {
  id: number;
  job_id: number;
  status: string;
  method: string;
  applied_at: string;
  job_title: string;
  job_company: string;
  job_url?: string;
  submitted_data: {
    name: string;
    email: string;
    phone: string;
  };
}

const Traceback: React.FC = () => {
  const { appId } = useParams();
  const [data, setData] = useState<ApplicationTraceback | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/applications/${appId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [appId]);

  const handleResolve = async () => {
    setResolving(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/applications/${appId}/resolve`,
        {
          method: "PUT",
        },
      );
      if (response.ok) {
        // Refresh data
        const res = await fetch(
          `http://localhost:8080/api/applications/${appId}`,
        );
        const newData = await res.json();
        setData(newData);
      }
    } catch (err) {
      console.error("Failed to resolve application:", err);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data)
    return <div className="p-8 text-center">Application not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/applications"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to History
      </Link>

      {data.status === "manual_review" && (
        <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-amber-900/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">
                Action Required: Manual Review
              </h3>
              <p className="text-amber-700 text-sm">
                The automation couldn't complete this application. Please finish
                it manually.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {data.job_url && (
              <a
                href={data.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                Finish Manually
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="flex-1 md:flex-none px-4 py-2.5 bg-white text-amber-600 border border-amber-200 rounded-xl text-sm font-bold hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {resolving ? "Resolving..." : "Mark Resolved"}
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/30">
                  Application Receipt
                </span>
                <span className="text-blue-100 text-sm font-medium">
                  #{data.id}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold">{data.job_title}</h1>
              <p className="text-blue-100 text-lg font-medium opacity-90">
                {data.job_company}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {new Date(data.applied_at).toLocaleString()}
                </span>
              </div>
              <span className="bg-green-400 text-green-950 text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg">
                {data.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* Snapshot Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Submitted Snapshot
                </h3>
                <p className="text-sm text-gray-500">
                  Exactly what we sent to the employer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="text-xs font-black uppercase text-gray-400">
                    Full Name
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {data.submitted_data?.name || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="text-xs font-black uppercase text-gray-400">
                    Email Address
                  </span>
                </div>
                <p
                  className="text-lg font-bold text-gray-800 truncate"
                  title={data.submitted_data?.email}
                >
                  {data.submitted_data?.email || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span className="text-xs font-black uppercase text-gray-400">
                    Phone Number
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {data.submitted_data?.phone || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Traceback Steps */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Application Traceback
                </h3>
                <p className="text-sm text-gray-500">
                  The lifecycle of this specific application.
                </p>
              </div>
            </div>

            <div className="relative pl-8 space-y-12 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    Job Detected & Analyzed
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    System matched requirements and confirmed compatibility for{" "}
                    {data.method.replace("_", " ")}.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    {new Date(data.applied_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    Data Injection Completed
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Automated script successfully located form fields and
                    injected your profile data.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-lg shadow-green-200">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    Final Confirmation
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Application was marked as{" "}
                    <strong>{data.status.replace("_", " ")}</strong>.
                  </p>
                  {data.job_url && (
                    <a
                      href={data.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
                    >
                      View Original Job Posting
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-gray-50 p-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm italic">
            This is a permanent record of the application sent on{" "}
            {new Date(data.applied_at).toLocaleDateString()}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Traceback;
