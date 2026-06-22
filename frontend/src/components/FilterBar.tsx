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
    <div className="flex flex-wrap items-center gap-4 text-xs text-brand-dark-text font-medium">
      <div className="flex items-center gap-1.5">
        <span className="font-semibold">Query:</span>
        <input
          type="text"
          placeholder="Title, skills..."
          className="w-36 px-2.5 py-1 text-xs border border-brand-border bg-white rounded-lg focus:outline-none focus:border-brand-terracotta"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-semibold">Location:</span>
        <input
          type="text"
          placeholder="e.g. Remote"
          className="w-28 px-2.5 py-1 text-xs border border-brand-border bg-white rounded-lg focus:outline-none focus:border-brand-terracotta"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="font-semibold">Min Salary:</span>
        <input
          type="range"
          min="0"
          max="300"
          step="10"
          className="w-24 cursor-pointer accent-brand-terracotta"
          value={filters.minSalary}
          onChange={(e) =>
            setFilters({ ...filters, minSalary: parseInt(e.target.value) })
          }
        />
        <span className="font-mono text-[10.5px] bg-brand-cream border border-brand-border px-1.5 py-0.5 rounded font-bold">
          ${filters.minSalary}k
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoApply"
          className="w-3.5 h-3.5 cursor-pointer accent-brand-terracotta"
          checked={filters.supportsAutoApply}
          onChange={(e) =>
            setFilters({ ...filters, supportsAutoApply: e.target.checked })
          }
        />
        <label
          htmlFor="autoApply"
          className="font-semibold cursor-pointer select-none"
        >
          Auto-Apply Friendly
        </label>
      </div>

      <button
        onClick={onApply}
        className="bento-btn py-1 px-4 text-xs font-bold"
      >
        Apply
      </button>
    </div>
  );
};

export default FilterBar;
