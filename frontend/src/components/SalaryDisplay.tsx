import React from "react";

interface SalaryDisplayProps {
  min: number | null;
  max: number | null;
  compact?: boolean;
}

const SalaryDisplay: React.FC<SalaryDisplayProps> = ({ min, max, compact = false }) => {
  if (!min && !max) return null;

  const format = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const colorClass = () => {
    const val = max || min || 0;
    if (val > 70000) return "text-green-600 bg-green-50";
    if (val > 40000) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const displayText = () => {
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    return format(max!);
  };

  if (compact) {
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colorClass()}`}>
        {displayText()}
      </span>
    );
  }

  return (
    <div className={`px-3 py-1 rounded-lg font-bold text-lg ${colorClass()}`}>
      {displayText()}
    </div>
  );
};

export default SalaryDisplay;
