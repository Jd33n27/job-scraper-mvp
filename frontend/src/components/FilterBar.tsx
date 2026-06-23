import React, { useState } from "react";
import { Search, MapPin, DollarSign, Filter } from "lucide-react";

interface FilterBarProps {
  onFilter?: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilter }) => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [supportsAutoApply, setSupportsAutoApply] = useState(false);

  const handleApplyFilters = () => {
    if (onFilter) {
      onFilter({ keyword, location, minSalary, supportsAutoApply });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center bg-[#faf7f2] border border-[#292523]/25 rounded-xl px-3 py-2 focus-within:border-cyan-500 transition-all duration-300">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search roles, keywords..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-sm text-[#171514] placeholder-slate-500 w-full ml-2 font-medium"
        />
      </div>

      <div className="flex gap-2 w-full">
        <div className="flex items-center flex-1 bg-[#faf7f2] border border-[#292523]/25 rounded-xl px-3 py-2 focus-within:border-cyan-500 transition-all">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-sm text-[#171514] placeholder-slate-500 w-full ml-2 font-medium"
          />
        </div>
        
        <div className="flex items-center w-28 bg-[#faf7f2] border border-[#292523]/25 rounded-xl px-3 py-2 focus-within:border-cyan-500 transition-all">
          <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="number"
            placeholder="Min (k)"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-sm text-[#171514] placeholder-slate-500 w-full ml-1 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center justify-center w-4 h-4 border border-white/20 rounded bg-white/5 group-hover:border-cyan-500/50 transition-colors">
            <input
              type="checkbox"
              checked={supportsAutoApply}
              onChange={(e) => setSupportsAutoApply(e.target.checked)}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
            {supportsAutoApply && (
              <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
            )}
          </div>
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
            Auto-Apply Only
          </span>
        </label>

        <button 
          onClick={handleApplyFilters}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-xs font-semibold text-cyan-400 transition-all cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter Data
        </button>
      </div>
    </div>
  );
};

export default FilterBar;