"use client";

import { useState, useEffect } from "react";
import { formatSalary } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/freshness";
import { 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Send, 
  Award,
  Sparkles
} from "lucide-react";
import Link from "next/link";

interface SavedRecord {
  id: string;
  status: "SAVED" | "APPLIED" | "INTERVIEW" | "REJECTED" | "OFFER";
  notes?: string;
  savedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    companyName: string;
    companyLogo?: string;
    location: string;
    workMode: string;
    experienceLevel: string;
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency: string;
    salaryPeriod: string;
    status: string;
    sourceName: string;
    applyUrl: string;
    postedAt: string;
    freshnessScore: number;
    skills: string[];
  };
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedRecord[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadSaved = async () => {
    try {
      const res = await fetch("/api/saved");
      const data = await res.json();
      setSavedJobs(data.savedJobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleUpdateStatus = async (recordId: string, jobId: string, newStatus: string) => {
    try {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, status: newStatus }),
      });
      setSavedJobs((prev) =>
        prev.map((item) => (item.id === recordId ? { ...item, status: newStatus as any } : item))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
      await fetch(`/api/saved?id=${recordId}`, { method: "DELETE" });
      setSavedJobs((prev) => prev.filter((item) => item.id !== recordId));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredJobs = activeTab === "ALL"
    ? savedJobs
    : savedJobs.filter((item) => item.status === activeTab);

  const tabs = [
    { id: "ALL", label: `All (${savedJobs.length})` },
    { id: "SAVED", label: `Saved (${savedJobs.filter((s) => s.status === "SAVED").length})` },
    { id: "APPLIED", label: `Applied (${savedJobs.filter((s) => s.status === "APPLIED").length})` },
    { id: "INTERVIEW", label: `Interview (${savedJobs.filter((s) => s.status === "INTERVIEW").length})` },
    { id: "REJECTED", label: `Rejected (${savedJobs.filter((s) => s.status === "REJECTED").length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold font-mono text-zinc-100">Saved Jobs Tracker</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Track your discovered opportunities, manage active applications, and monitor status updates.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300"
        >
          <span>Find more jobs</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-6 overflow-x-auto text-xs font-mono">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-zinc-800 border-zinc-700 text-emerald-400 font-bold"
                : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs font-mono text-zinc-500">Loading saved jobs...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-zinc-950 border border-zinc-800">
          <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-bold text-zinc-300 mb-1">No saved jobs in this category</h3>
          <p className="text-xs text-zinc-500 mb-4">Click the bookmark icon on any job card to track it here.</p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold font-mono"
          >
            Explore Live Feed
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((record) => {
            const job = record.job;
            const salary = formatSalary(job.minSalary, job.maxSalary, job.salaryCurrency, job.salaryPeriod);
            const isClosed = job.status !== "ACTIVE";

            return (
              <div
                key={record.id}
                className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-zinc-300 flex-shrink-0">
                    {job.companyName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-sm font-semibold text-zinc-100 hover:text-emerald-400 font-mono truncate"
                      >
                        {job.title}
                      </Link>
                      {isClosed && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800">
                          CLOSED
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-400">
                      <span className="text-zinc-300 font-medium">{job.companyName}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">{salary}</span>
                      <span>•</span>
                      <span className="text-zinc-500">Saved {formatRelativeTime(record.savedAt)}</span>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Switcher & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs">
                  <select
                    value={record.status}
                    onChange={(e) => handleUpdateStatus(record.id, job.id, e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-600 text-xs"
                  >
                    <option value="SAVED">Saved</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="OFFER">Offer</option>
                  </select>

                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white"
                    title="Apply link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-rose-950/80 border border-zinc-700 hover:border-rose-800 text-zinc-400 hover:text-rose-400"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}