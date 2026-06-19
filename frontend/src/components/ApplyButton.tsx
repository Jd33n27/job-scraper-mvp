import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApplyModal from "./ApplyModal";

interface ApplyButtonProps {
  jobId: number;
  applicationId?: number | null;
}

const ApplyButton: React.FC<ApplyButtonProps> = ({ jobId, applicationId }) => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleConfirmApply = async (userData: any) => {
    setShowModal(false);
    setStatus("loading");
    try {
      const response = await fetch(
        `http://localhost:8080/api/jobs/${jobId}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_data: userData,
            method: "auto_applied",
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStatus("success");
        setMessage("Application started!");
        // Redirect to traceback after a short delay
        setTimeout(() => {
          navigate(`/applications/${data.application_id}`);
        }, 1500);
      } else {
        const errorText = await response.text();
        setStatus("error");
        setMessage(errorText || "Failed to apply.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error.");
    }
  };

  if (applicationId || status === "success") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (applicationId) navigate(`/applications/${applicationId}`);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-all border border-green-200"
      >
        <CheckCircle2 className="w-4 h-4" />
        Applied
        <Eye className="w-3 h-3 ml-1 opacity-50" />
      </button>
    );
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
          }}
          disabled={status === "loading"}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            status === "loading"
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : status === "error"
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {status === "error" ? "Retry Apply" : "Auto Apply"}
        </button>
        {message && (
          <span
            className={`text-[10px] flex items-center gap-1 ${status === "error" ? "text-red-500" : "text-green-600"}`}
          >
            {status === "error" && <AlertCircle className="w-2 h-2" />}
            {message}
          </span>
        )}
      </div>

      {showModal && (
        <ApplyModal
          jobId={jobId}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmApply}
        />
      )}
    </>
  );
};

export default ApplyButton;
