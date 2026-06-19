import React from "react";

interface FilterBarProps {
  filters: {
    keyword: string;
    location: string;
    supportsAutoApply: boolean;
    minSalary: number;
  };
  setFilters: (filters: {
    keyword: string;
    location: string;
    supportsAutoApply: boolean;
    minSalary: number;
  }) => void;
  onApply: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  onApply,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 font-sans text-[11px] text-black">
      <div className="flex items-center gap-1">
        <span className="font-bold">Query:</span>
        <input
          type="text"
          placeholder="Title, skills..."
          className="w-36 px-1.5 py-0.5 font-mono text-[11px] border border-gray-500 bg-white"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="font-bold">Location:</span>
        <input
          type="text"
          placeholder="e.g. Remote"
          className="w-28 px-1.5 py-0.5 font-mono text-[11px] border border-gray-500 bg-white"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-bold">Min Salary:</span>
        <input
          type="range"
          min="0"
          max="300"
          step="10"
          className="w-20 cursor-pointer accent-[#0a5fcf]"
          value={filters.minSalary}
          onChange={(e) =>
            setFilters({ ...filters, minSalary: parseInt(e.target.value) })
          }
        />
        <span className="font-mono text-[10px] bg-white border border-gray-400 px-0.5 select-all">${filters.minSalary}k</span>
      </div>

      <div className="flex items-center gap-1">
        <input
          type="checkbox"
          id="autoApply"
          className="w-3 h-3 cursor-pointer"
          checked={filters.supportsAutoApply}
          onChange={(e) =>
            setFilters({ ...filters, supportsAutoApply: e.target.checked })
          }
        />
        <label
          htmlFor="autoApply"
          className="font-bold cursor-pointer select-none"
        >
          Auto-Apply
        </label>
      </div>

      <button
        onClick={onApply}
        className="mac-btn px-2 py-0.5"
        style={{ padding: "2px 8px", fontSize: "10.5px" }}
      >
        Apply
      </button>
    </div>
  );
};

export default FilterBar;
