import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApplyModal from "./ApplyModal";

import { API_BASE_URL } from "../config";

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
        `${API_BASE_URL}/jobs/${jobId}/apply`,
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
        className="mac-btn !text-green-800 bg-[#e2f0d9] border-[#a8d08d]"
      >
        <CheckCircle2 className="w-3 h-3 text-[#375623]" />
        Applied
        <Eye className="w-2.5 h-2.5 ml-1 opacity-55" />
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
          className="mac-btn"
        >
          {status === "loading" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          {status === "error" ? "Retry Apply" : "Auto Apply"}
        </button>
        {message && (
          <span
            className={`text-[9px] font-mono flex items-center gap-1 ${status === "error" ? "text-red-600 font-bold" : "text-green-700"}`}
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
