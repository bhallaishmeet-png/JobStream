"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Briefcase, Calendar, Bell } from "lucide-react";

interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectQuickFilter: (key: string, value: string) => void;
  onCreateAlert: () => void;
  discoveredLastHour: number;
  sourcesMonitored: number;
}

export function HeroSearch({
  searchQuery,
  onSearchChange,
  onSelectQuickFilter,
  onCreateAlert,
  discoveredLastHour,
  sourcesMonitored,
}: HeroSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localQuery);
  };

  const sampleSearches = [
    "React Developer",
    "AI Intern",
    "Python",
    "Product Manager",
    "Go",
  ];

  return (
    <section className="relative pt-6 pb-8 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Live Discovered Telemetry Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{discoveredLastHour}</span>
          <span>new jobs in past hour</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>{sourcesMonitored} sources monitored</span>
        </div>

        {/* Headlines */}
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2.5 font-mono">
          The internet&apos;s <span className="text-emerald-600 dark:text-emerald-400">live job feed.</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-6">
          Continuous discovery of newly verified positions across authorized developer networks and direct career endpoints.
        </p>

        {/* Main Search Bar */}
        <form onSubmit={handleFormSubmit} className="relative max-w-2xl mx-auto mb-4">
          <div className="relative flex items-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all">
            <Search className="w-4 h-4 ml-4 text-zinc-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                onSearchChange(e.target.value);
              }}
              placeholder="Search by role, tech stack, or company..."
              className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none font-sans"
            />
            <div className="hidden sm:flex items-center gap-1.5 mr-3">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">
                /
              </kbd>
            </div>
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("");
                  onSearchChange("");
                }}
                className="mr-3 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="mr-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Sample Suggestions Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5 text-xs">
          <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[11px] mr-1">Popular:</span>
          {sampleSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setLocalQuery(term);
                onSearchChange(term);
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors text-xs font-mono shadow-sm cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Quick Filter Pills & Alert CTA */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            onClick={() => onSelectQuickFilter("locations", "Remote")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors font-mono shadow-sm cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Remote</span>
          </button>
          <button
            onClick={() => onSelectQuickFilter("locations", "Bangalore")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors font-mono shadow-sm cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Bangalore</span>
          </button>
          <button
            onClick={() => onSelectQuickFilter("experienceLevels", "FRESHER")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors font-mono shadow-sm cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Fresher / Intern</span>
          </button>
          <button
            onClick={() => onSelectQuickFilter("postedWithin", "1h")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors font-mono shadow-sm cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Last 1 Hour</span>
          </button>

          <button
            onClick={onCreateAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-medium font-mono transition-colors shadow-sm cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Create Alert</span>
          </button>
        </div>
      </div>
    </section>
  );
}