"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, MapPin, Briefcase, Home, Calendar, Building, Bell } from "lucide-react";

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
    <section className="relative pt-6 pb-8 border-b border-zinc-800/80 terminal-grid">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Live Discovered Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-400 font-bold">{discoveredLastHour}</span>
          <span>new jobs discovered in the last hour</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Sources monitored: {sourcesMonitored}</span>
        </div>

        {/* Headlines */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 font-mono">
          The internet&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">live job feed.</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-6">
          Discover newly posted opportunities from across the web, filtered around what matters to you.
        </p>

        {/* Main Search Bar */}
        <form onSubmit={handleFormSubmit} className="relative max-w-2xl mx-auto mb-3">
          <div className="relative flex items-center rounded-xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
            <Search className="w-5 h-5 ml-4 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                onSearchChange(e.target.value);
              }}
              placeholder="Search jobs, skills, companies..."
              className="w-full bg-transparent px-3 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <div className="hidden sm:flex items-center gap-1.5 mr-3">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 rounded shadow-sm">
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
                className="mr-3 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="mr-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Sample Suggestions Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs text-zinc-400">
          <span className="text-zinc-500 font-mono text-[11px]">Popular:</span>
          {sampleSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setLocalQuery(term);
                onSearchChange(term);
              }}
              className="px-2.5 py-1 rounded-md bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors text-[11px]"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Quick Filter Pills & Alert CTA */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            onClick={() => onSelectQuickFilter("locations", "Remote")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Remote</span>
          </button>
          <button
            onClick={() => onSelectQuickFilter("locations", "Bangalore")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bangalore</span>
          </button>
          <button
            onClick={() => onSelectQuickFilter("experienceLevels", "FRESHER")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Fresher / Intern</span>
          </button>
          <button
            onClick={() => onSelectQuickFilter("postedWithin", "1h")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-orange-400 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>Last 1 Hour</span>
          </button>

          <button
            onClick={onCreateAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-medium transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Create Job Alert</span>
          </button>
        </div>
      </div>
    </section>
  );
}