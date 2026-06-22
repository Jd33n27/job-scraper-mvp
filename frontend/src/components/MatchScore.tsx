import React from "react";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const MatchScore: React.FC<MatchScoreProps> = ({ score, size = "md" }) => {
  const getColor = () => {
    if (score >= 80) return "text-[#1E5D2F] bg-[#EBF7EE] border-[#C5ECD0]";
    if (score >= 60) return "text-[#B06000] bg-[#FFF9E6] border-[#FCE8B2]";
    if (score >= 40) return "text-[#A64115] bg-[#FDF2ED] border-[#FAD6C5]";
    return "text-brand-muted-text bg-brand-cream border-brand-border";
  };

  const getLabel = () => {
    if (score >= 80) return "Strong Alignment";
    if (score >= 60) return "Good Alignment";
    if (score >= 40) return "Moderate Alignment";
    return "Low Alignment";
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10.5px]",
    md: "px-3 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`font-mono font-black border rounded-full ${sizeClasses[size]} ${getColor()}`}>
        {score}%
      </div>
      {size !== "sm" && (
        <span className="text-xs font-semibold text-brand-muted-text">{getLabel()}</span>
      )}
    </div>
  );
};

export default MatchScore;
