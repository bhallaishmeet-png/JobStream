"use client";

import { useState } from "react";
import { JobFilterState } from "@/lib/types";
import { 
  Filter, 
  RotateCcw, 
  X,
  Plus
} from "lucide-react";

interface FilterPanelProps {
  filters: JobFilterState;
  onFilterChange: (newFilters: Partial<JobFilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

const PRESET_LOCATIONS = [
  "Remote",
  "India",
  "Bangalore",
  "Gurgaon",
  "Noida",
  "Delhi",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Chandigarh",
];

const EXPERIENCE_LEVELS = [
  { id: "FRESHER", label: "Fresher" },
  { id: "0-1", label: "0 to 1 years" },
  { id: "1-2", label: "1 to 2 years" },
  { id: "2-3", label: "2 to 3 years" },
  { id: "3-5", label: "3 to 5 years" },
  { id: "5-10", label: "5 to 10 years" },
  { id: "10+", label: "10+ years" },
];

const JOB_TYPES = [
  { id: "FULL_TIME", label: "Full-time" },
  { id: "PART_TIME", label: "Part-time" },
  { id: "INTERNSHIP", label: "Internship" },
  { id: "CONTRACT", label: "Contract" },
  { id: "FREELANCE", label: "Freelance" },
];

const WORK_MODES = [
  { id: "REMOTE", label: "Remote" },
  { id: "HYBRID", label: "Hybrid" },
  { id: "ON_SITE", label: "On-site" },
];

const POSTED_WINDOWS = [
  { id: "5m", label: "Last 5 minutes" },
  { id: "15m", label: "Last 15 minutes" },
  { id: "30m", label: "Last 30 minutes" },
  { id: "1h", label: "Last hour" },
  { id: "3h", label: "Last 3 hours" },
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
];

const POPULAR_SKILLS = [
  "React", "TypeScript", "Python", "Go", "Next.js", "AI", "Machine Learning", 
  "PostgreSQL", "Node.js", "Kubernetes", "Docker", "Java"
];

export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}: FilterPanelProps) {
  const [customLocInput, setCustomLocInput] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Toggle helper for array filters
  const toggleArrayItem = (key: "locations" | "experienceLevels" | "workModes" | "jobTypes" | "skills", item: string) => {
    const current = filters[key] || [];
    const exists = current.includes(item);
    const updated = exists ? current.filter((x) => x !== item) : [...current, item];
    onFilterChange({ [key]: updated, page: 1 });
  };

  const handleAddCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLocInput.trim()) {
      toggleArrayItem("locations", customLocInput.trim());
      setCustomLocInput("");
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkillInput.trim()) {
      toggleArrayItem("skills", customSkillInput.trim());
      setCustomSkillInput("");
    }
  };

  const activeFilterCount =
    (filters.locations?.length || 0) +
    (filters.experienceLevels?.length || 0) +
    (filters.workModes?.length || 0) +
    (filters.jobTypes?.length || 0) +
    (filters.skills?.length || 0) +
    (filters.postedWithin ? 1 : 0) +
    (filters.minSalary ? 1 : 0);

  const content = (
    <div className="space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Filters ({totalResults} matches)</span>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Location Filter */}
      <div>
        <label className="block font-mono uppercase text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 font-semibold">
          Location
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {PRESET_LOCATIONS.map((loc) => {
            const isSelected = filters.locations?.includes(loc);
            return (
              <button
                key={loc}
                type="button"
                onClick={() => toggleArrayItem("locations", loc)}
                className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/80 text-emerald-700 dark:text-emerald-300 font-medium"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>

        {/* Custom Location input */}
        <form onSubmit={handleAddCustomLocation} className="flex gap-1.5">
          <input
            type="text"
            placeholder="Add custom city..."
            value={customLocInput}
            onChange={(e) => setCustomLocInput(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-mono"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 2. Experience Level */}
      <div>
        <label className="block font-mono uppercase text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 font-semibold">
          Experience
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {EXPERIENCE_LEVELS.map((exp) => {
            const isSelected = filters.experienceLevels?.includes(exp.id);
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => toggleArrayItem("experienceLevels", exp.id)}
                className={`px-2.5 py-1.5 rounded text-[11px] text-left border transition-colors ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/80 text-emerald-700 dark:text-emerald-300 font-medium"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {exp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Work Mode */}
      <div>
        <label className="block font-mono uppercase text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 font-semibold">
          Work Mode
        </label>
        <div className="flex gap-1.5">
          {WORK_MODES.map((mode) => {
            const isSelected = filters.workModes?.includes(mode.id);
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => toggleArrayItem("workModes", mode.id)}
                className={`flex-1 py-1.5 rounded text-[11px] text-center border transition-colors ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/80 text-emerald-700 dark:text-emerald-300 font-medium"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Job Type */}
      <div>
        <label className="block font-mono uppercase text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 font-semibold">
          Job Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {JOB_TYPES.map((type) => {
            const isSelected = filters.jobTypes?.includes(type.id);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleArrayItem("jobTypes", type.id)}
                className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/80 text-emerald-700 dark:text-emerald-300 font-medium"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Posted Within */}
      <div>
        <label className="block font-mono uppercase text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 font-semibold">
          Posted Time Window
        </label>
        <div className="flex flex-wrap gap-1.5">
          {POSTED_WINDOWS.map((win) => {
            const isSelected = filters.postedWithin === win.id;
            return (
              <button
                key={win.id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    postedWithin: isSelected ? undefined : win.id,
                    page: 1,
                  })
                }
                className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                  isSelected
                    ? "bg-orange-500/15 border-orange-500/80 text-orange-700 dark:text-orange-300 font-medium"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {win.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Skills Filter */}
      <div>
        <label className="block font-mono uppercase text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 font-semibold">
          Skills
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {POPULAR_SKILLS.map((skill) => {
            const isSelected = filters.skills?.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleArrayItem("skills", skill)}
                className={`px-2 py-0.5 rounded text-[11px] border font-mono transition-colors ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/80 text-cyan-700 dark:text-cyan-300 font-medium"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleAddCustomSkill} className="flex gap-1.5">
          <input
            type="text"
            placeholder="Add skill tag..."
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-mono"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 7. Salary Minimum Filter */}
      <div>
        <label className="block font-mono uppercase text-[11px] text-zinc-600 dark:text-zinc-400 mb-2 font-semibold">
          Minimum Salary (LPA / Annual)
        </label>
        <div className="flex items-center gap-2">
          {[1000000, 1800000, 2500000, 3500000].map((sal) => {
            const isSelected = filters.minSalary === sal;
            return (
              <button
                key={sal}
                type="button"
                onClick={() =>
                  onFilterChange({
                    minSalary: isSelected ? undefined : sal,
                    page: 1,
                  })
                }
                className={`flex-1 py-1 rounded text-[10px] font-mono border transition-colors ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                ₹{sal / 100000}L+
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0 p-5 rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 sticky top-24 self-start shadow-md dark:shadow-xl transition-colors duration-150">
        {content}
      </aside>

      {/* Mobile Drawer Trigger */}
      <div className="lg:hidden flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-mono shadow-sm"
        >
          <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Filters ({activeFilterCount > 0 ? `${activeFilterCount} active` : "All"})</span>
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 font-mono"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Mobile Bottom Sheet Modal */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 rounded-t-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">Filter Job Stream</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {content}

            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                Apply Filters ({totalResults} results)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}