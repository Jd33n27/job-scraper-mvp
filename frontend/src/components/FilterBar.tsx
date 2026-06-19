import React from "react";
import { Search, MapPin } from "lucide-react";

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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Title or keywords..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Location..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-gray-400 px-1">
          Min Salary: ${filters.minSalary}k
        </span>
        <input
          type="range"
          min="0"
          max="300"
          step="10"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          value={filters.minSalary}
          onChange={(e) =>
            setFilters({ ...filters, minSalary: parseInt(e.target.value) })
          }
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="autoApply"
          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          checked={filters.supportsAutoApply}
          onChange={(e) =>
            setFilters({ ...filters, supportsAutoApply: e.target.checked })
          }
        />
        <label
          htmlFor="autoApply"
          className="text-sm font-medium text-gray-700"
        >
          Auto-Apply Available
        </label>
      </div>
      <button
        onClick={onApply}
        className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default FilterBar;
