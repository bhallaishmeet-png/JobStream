"use client";

import { useState, useEffect } from "react";
import { JobItem } from "@/lib/types";
import { formatSalary } from "@/lib/utils";
import { formatRelativeTime, calculateFreshness } from "@/lib/freshness";
import { MapPin, Briefcase, Home, Bookmark, ExternalLink, Layers, Sparkles } from "lucide-react";

interface JobCardProps {
  job: JobItem;
  onViewDetails: (job: JobItem) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
}

export function JobCard({
  job,
  onViewDetails,
  isSaved = false,
  onToggleSave,
}: JobCardProps) {
  // Dynamically ticking relative time every 10 seconds
  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(job.postedAt));
  const [freshness, setFreshness] = useState(() => calculateFreshness(job.postedAt));

  useEffect(() => {
    const updateTime = () => {
      setRelativeTime(formatRelativeTime(job.postedAt));
      setFreshness(calculateFreshness(job.postedAt));
    };
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [job.postedAt]);

  const salaryDisplay = formatSalary(
    job.minSalary,
    job.maxSalary,
    job.salaryCurrency,
    job.salaryPeriod
  );

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Top Bar: Company Logo, Title, Company, Freshness Score */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-3 min-w-0">
            {/* Company Avatar / Logo */}
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center overflow-hidden flex-shrink-0">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to text initials if image fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xs font-mono font-bold text-zinc-300">
                  {job.companyName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                <span className="font-medium text-zinc-300 hover:underline">
                  {job.companyName}
                </span>
                {job.isDemo && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                    DEMO DATA
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Freshness Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs font-bold ${freshness.badgeColor} ${freshness.textColor}`}
            title={`Freshness score: ${freshness.score}/100`}
          >
            <span>{freshness.score} Freshness</span>
          </div>
        </div>

        {/* Metadata Badges: Location, Experience, Work Mode, Salary */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 my-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span>{job.location}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
            <span>{job.experienceLevel} yrs</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-zinc-500" />
            <span className="capitalize">{job.workMode.toLowerCase()}</span>
          </div>

          {salaryDisplay !== "Not disclosed" && (
            <div className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
              <span>{salaryDisplay}</span>
            </div>
          )}
        </div>

        {/* Skills Badges */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 my-2.5">
            {job.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded text-[11px] bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 font-mono"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="text-[10px] text-zinc-500 font-mono">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Posting Time, Match %, Canonical Sources, Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-zinc-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Dynamic Posting Time */}
          <span className="text-zinc-400 font-mono text-[11px]">
            Posted {relativeTime}
          </span>

          {/* AI Match Percentage */}
          {job.matchScore && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{job.matchScore}% Match</span>
            </div>
          )}

          {/* Canonical Multi-source Badge */}
          {job.totalSources && job.totalSources > 1 && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono"
              title={`Discovered on ${job.totalSources} distinct sources`}
            >
              <Layers className="w-3 h-3" />
              <span>Found on {job.totalSources} sources</span>
            </div>
          )}

          {/* Source Attribution Tag */}
          <span className="text-zinc-500 text-[11px]">
            Source: <span className="text-zinc-400">{job.sourceName}</span>
          </span>
        </div>

        {/* Buttons: View Job & Save */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails(job)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-medium transition-colors"
          >
            View Job
          </button>

          <button
            onClick={() => onToggleSave && onToggleSave(job.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                : "bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-400 hover:text-zinc-200"
            }`}
            title={isSaved ? "Saved to your list" : "Save job"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-emerald-400 text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}