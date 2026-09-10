"use client";

import { useState, useEffect } from "react";
import { JobItem, UserSearchProfile } from "@/lib/types";
import { JobCard } from "@/components/feed/JobCard";
import { JobDetailModal } from "@/components/feed/JobDetailModal";
import { 
  LayoutDashboard, 
  Sparkles, 
  Clock, 
  Bookmark, 
  Send, 
  Bell, 
  TrendingUp, 
  UserCircle 
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserSearchProfile | null>(null);
  const [matchingJobs, setMatchingJobs] = useState<JobItem[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [discoveredLastHour, setDiscoveredLastHour] = useState(12);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load profile
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      });

    // Load saved jobs & counts
    fetch("/api/saved")
      .then((res) => res.json())
      .then((data) => {
        const list = data.savedJobs || [];
        setSavedCount(list.length);
        setAppliedCount(list.filter((j: any) => j.status === "APPLIED").length);
        setSavedJobIds(new Set(list.map((j: any) => j.job.id)));
      });

    // Load alerts count
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlertsCount((data.alerts || []).length);
      });

    // Load matching jobs sorted by best match
    fetch("/api/jobs?sortBy=best_match&limit=8")
      .then((res) => res.json())
      .then((data) => {
        setMatchingJobs(data.jobs || []);
        if (data.stats) {
          setDiscoveredLastHour(data.stats.discoveredLastHour);
        }
      });
  }, []);

  const handleToggleSave = async (jobId: string) => {
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, action: "toggle" }),
      });
      const data = await res.json();
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        if (data.isSaved) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
      setSavedCount((prev) => (data.isSaved ? prev + 1 : prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 mb-8 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold font-mono text-zinc-100">Your Job Dashboard</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time telemetry tailored to your skills in {profile?.skills.slice(0, 4).join(", ") || "Full Stack & AI"}.
          </p>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
        >
          <UserCircle className="w-4 h-4 text-emerald-400" />
          <span>Edit Search Profile</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono">NEW MATCHING</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {matchingJobs.length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono">PAST HOUR</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {discoveredLastHour}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono">SAVED</span>
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {savedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono">APPLICATIONS</span>
            <Send className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {appliedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[11px] font-mono">ACTIVE ALERTS</span>
            <Bell className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400">
            {alertsCount}
          </div>
        </div>
      </div>

      {/* Recommended Matches Section */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-bold font-mono text-zinc-100">Your Newest Matches</h2>
        </div>
        <Link href="/" className="text-xs font-mono text-emerald-400 hover:underline">
          View Full Live Feed →
        </Link>
      </div>

      {matchingJobs.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 font-mono text-xs">
          Scanning live stream for top matches...
        </div>
      ) : (
        <div className="space-y-3.5">
          {matchingJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={(j) => setSelectedJob(j)}
              isSaved={savedJobIds.has(job.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobIds.has(selectedJob.id) : false}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}