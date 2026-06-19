import React from "react";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const MatchScore: React.FC<MatchScoreProps> = ({ score, size = "md" }) => {
  const getColor = () => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-400 bg-gray-50 border-gray-200";
  };

  const getLabel = () => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div className={`flex items-center gap-2`}>
      <div className={`font-bold border rounded-full ${sizeClasses[size]} ${getColor()}`}>
        {score}%
      </div>
      {size !== "sm" && (
        <span className="text-xs font-medium text-gray-500">{getLabel()}</span>
      )}
    </div>
  );
};

export default MatchScore;
