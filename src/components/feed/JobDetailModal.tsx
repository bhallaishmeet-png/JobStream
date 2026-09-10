"use client";

import { useState, useEffect } from "react";
import { JobItem } from "@/lib/types";
import { formatSalary } from "@/lib/utils";
import { formatRelativeTime, calculateFreshness } from "@/lib/freshness";
import { 
  X, 
  MapPin, 
  Briefcase, 
  Home, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Bell,
  ShieldCheck,
  Ban
} from "lucide-react";

interface JobDetailModalProps {
  job: JobItem | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  onCreateSimilarAlert?: (job: JobItem) => void;
}

export function JobDetailModal({
  job,
  isOpen,
  onClose,
  isSaved = false,
  onToggleSave,
  onCreateSimilarAlert,
}: JobDetailModalProps) {
  const [currentJob, setCurrentJob] = useState<JobItem | null>(job);
  const [lastVerifiedSec, setLastVerifiedSec] = useState(42);

  useEffect(() => {
    setCurrentJob(job);
  }, [job]);

  // Poll job status every 15s while viewing to catch real-time closure
  useEffect(() => {
    if (!job?.id || !isOpen) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/jobs/${job.id}`);
        if (res.ok) {
          const updated = await res.json();
          setCurrentJob(updated);
        }
      } catch (e) {
        // silent
      }
    };

    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [job?.id, isOpen]);

  // Dynamically ticking "Last verified X seconds ago"
  useEffect(() => {
    if (!isOpen) return;
    setLastVerifiedSec(14);
    const interval = setInterval(() => {
      setLastVerifiedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !currentJob) return null;

  const isClosed = currentJob.status !== "ACTIVE";
  const freshness = calculateFreshness(currentJob.postedAt);
  const salaryDisplay = formatSalary(
    currentJob.minSalary,
    currentJob.maxSalary,
    currentJob.salaryCurrency,
    currentJob.salaryPeriod
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Closed Job Alert Banner */}
        {isClosed && (
          <div className="flex items-center gap-2.5 px-6 py-3 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-xs font-semibold">
            <Ban className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>This job has just closed and was removed from your results.</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-900/40">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center overflow-hidden flex-shrink-0">
              {currentJob.companyLogo ? (
                <img
                  src={currentJob.companyLogo}
                  alt={currentJob.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-mono font-bold text-zinc-300">
                  {currentJob.companyName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-zinc-100 font-mono">
                  {currentJob.title}
                </h2>
                {currentJob.isDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                    DEMO DATA
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">
                  {currentJob.companyName}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {currentJob.location}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="font-mono text-emerald-400">
                  {salaryDisplay}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-300">
          {/* Metadata Ticker Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Posted:</span>
              <span className="text-zinc-200">{formatRelativeTime(currentJob.postedAt)}</span>
              <span className={`px-2 py-0.5 rounded border font-bold ${freshness.badgeColor} ${freshness.textColor}`}>
                {freshness.score} Freshness
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Last verified {lastVerifiedSec} seconds ago</span>
            </div>
          </div>

          {/* Canonical Multi-source Discovery Box */}
          {currentJob.sourcesList && currentJob.sourcesList.length > 0 && (
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 mb-2">
                <Layers className="w-4 h-4" />
                <span>Canonical Job Record (Found on {currentJob.sourcesList.length} sources)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentJob.sourcesList.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs text-zinc-300 hover:text-white transition-colors"
                  >
                    <span>{src.sourceName}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Match Section */}
          {currentJob.matchScore && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 shadow-inner">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Why this matches you ({currentJob.matchScore}% Match)</span>
                </div>
              </div>

              {/* Matched & Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                {currentJob.matchedSkills && currentJob.matchedSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-zinc-400 font-mono text-[11px]">Matched Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentJob.matchedSkills.map((sk) => (
                        <span key={sk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentJob.missingSkills && currentJob.missingSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-zinc-400 font-mono text-[11px]">Potential Missing Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentJob.missingSkills.map((sk) => (
                        <span key={sk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {currentJob.matchReasons && currentJob.matchReasons.length > 0 && (
                <ul className="space-y-1 text-xs text-zinc-400 list-disc list-inside">
                  {currentJob.matchReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* AI Summary */}
          {currentJob.aiSummary && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                AI Role Summary
              </h4>
              <p className="text-xs leading-relaxed text-zinc-300 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800">
                {currentJob.aiSummary}
              </p>
            </div>
          )}

          {/* Skills Required */}
          {currentJob.skills && currentJob.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Required Tech Stack & Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentJob.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Description */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Job Description
            </h4>
            <div className="text-xs sm:text-sm leading-relaxed text-zinc-300 whitespace-pre-line bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80">
              {currentJob.description}
            </div>
          </div>

          {/* Responsibilities */}
          {currentJob.responsibilities && currentJob.responsibilities.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Key Responsibilities
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-zinc-300">
                {currentJob.responsibilities.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {currentJob.requirements && currentJob.requirements.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Requirements & Qualifications
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-zinc-300">
                {currentJob.requirements.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {currentJob.benefits && currentJob.benefits.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Benefits & Perks
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-sm text-zinc-300">
                {currentJob.benefits.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onCreateSimilarAlert && onCreateSimilarAlert(currentJob)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-medium transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-zinc-400" />
            <span>Create Alert for Similar Jobs</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave && onToggleSave(currentJob.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
                isSaved
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-emerald-400" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Job"}</span>
            </button>

            {isClosed ? (
              <button
                disabled
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-800 text-zinc-500 border border-zinc-700 text-xs font-bold cursor-not-allowed"
              >
                <span>Job Closed</span>
              </button>
            ) : (
              <a
                href={currentJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>Apply on {currentJob.sourceName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}