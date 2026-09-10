"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { JobItem, JobFilterState, LiveDiffResponse } from "@/lib/types";
import { HeroSearch } from "@/components/feed/HeroSearch";
import { LiveStatusBar } from "@/components/feed/LiveStatusBar";
import { LiveUpdatePill } from "@/components/feed/LiveUpdatePill";
import { JobCard } from "@/components/feed/JobCard";
import { FilterPanel } from "@/components/feed/FilterPanel";
import { JobDetailModal } from "@/components/feed/JobDetailModal";
import { EmptyFeedState } from "@/components/feed/EmptyFeedState";
import { ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

const DEFAULT_FILTERS: JobFilterState = {
  searchQuery: "",
  locations: [],
  experienceLevels: [],
  workModes: [],
  jobTypes: [],
  skills: [],
  sortBy: "newest",
  page: 1,
  limit: 20,
};

export default function HomePage() {
  const router = useRouter();

  // State
  const [filters, setFilters] = useState<JobFilterState>(DEFAULT_FILTERS);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Real-time diff updates queue
  const [stagedNewJobs, setStagedNewJobs] = useState<JobItem[]>([]);
  const [closedCount, setClosedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);

  // Stats
  const [totalActiveCount, setTotalActiveCount] = useState(0);
  const [discoveredLastHour, setDiscoveredLastHour] = useState(0);
  const [activeSourcesCount, setActiveSourcesCount] = useState(0);

  // Selected Job for modal
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Keep a ref of known IDs to check against in live updates
  const knownIdsRef = useRef<string[]>([]);
  useEffect(() => {
    knownIdsRef.current = jobs.map((j) => j.id);
  }, [jobs]);

  // Load Saved IDs
  useEffect(() => {
    fetch("/api/saved")
      .then((res) => res.json())
      .then((data) => {
        if (data.savedJobs) {
          setSavedJobIds(new Set(data.savedJobs.map((s: any) => s.job.id)));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Jobs based on filters
  const fetchJobs = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const params = new URLSearchParams();
      if (filters.searchQuery) params.set("q", filters.searchQuery);
      if (filters.locations.length > 0) params.set("locations", filters.locations.join(","));
      if (filters.experienceLevels.length > 0) params.set("experienceLevels", filters.experienceLevels.join(","));
      if (filters.workModes.length > 0) params.set("workModes", filters.workModes.join(","));
      if (filters.jobTypes.length > 0) params.set("jobTypes", filters.jobTypes.join(","));
      if (filters.minSalary) params.set("minSalary", filters.minSalary.toString());
      if (filters.maxSalary) params.set("maxSalary", filters.maxSalary.toString());
      if (filters.postedWithin) params.set("postedWithin", filters.postedWithin);
      if (filters.skills.length > 0) params.set("skills", filters.skills.join(","));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      params.set("page", filters.page.toString());
      params.set("limit", filters.limit.toString());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load jobs");

      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalMatches(data.pagination?.total || 0);

      if (data.stats) {
        setTotalActiveCount(data.stats.totalActiveCount);
        setDiscoveredLastHour(data.stats.discoveredLastHour);
        setActiveSourcesCount(data.stats.activeSourcesCount);
      }

      setLastUpdated(new Date());
      // Reset staged diffs
      setStagedNewJobs([]);
      setClosedCount(0);
      setUpdatedCount(0);
    } catch (err) {
      console.error("fetchJobs error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  // Initial and Filter changes effect
  useEffect(() => {
    fetchJobs(true);
  }, [fetchJobs]);

  // Real-time 60s background diffing check
  const checkLiveUpdates = useCallback(async () => {
    if (isRefreshing || isLoading) return;
    setIsRefreshing(true);

    try {
      const knownIds = knownIdsRef.current.slice(0, 30).join(",");
      const since = lastUpdated.toISOString();

      const res = await fetch(`/api/jobs/live-updates?since=${encodeURIComponent(since)}&knownIds=${encodeURIComponent(knownIds)}`);
      if (!res.ok) return;

      const diff: LiveDiffResponse = await res.json();

      setTotalActiveCount(diff.totalActiveCount);
      setDiscoveredLastHour(diff.discoveredLastHour);
      setActiveSourcesCount(diff.activeSourcesCount);
      setLastUpdated(new Date());

      // If any closed jobs detected that are currently in the user feed:
      if (diff.closedJobIds && diff.closedJobIds.length > 0) {
        setJobs((prev) => prev.filter((j) => !diff.closedJobIds.includes(j.id)));
        setClosedCount((prev) => prev + diff.closedJobIds.length);

        // If user currently has a closed job opened in modal, update its status
        if (selectedJob && diff.closedJobIds.includes(selectedJob.id)) {
          setSelectedJob((prev) => (prev ? { ...prev, status: "CLOSED" } : null));
        }
      }

      // If new jobs discovered, queue them in staged banner
      if (diff.newJobs && diff.newJobs.length > 0) {
        setStagedNewJobs((prev) => {
          const existingIds = new Set(prev.map((j) => j.id));
          const additions = diff.newJobs.filter((j) => !existingIds.has(j.id));
          return [...additions, ...prev];
        });
      }

      if (diff.updatedJobs && diff.updatedJobs.length > 0) {
        setUpdatedCount((prev) => prev + diff.updatedJobs.length);
      }
    } catch (err) {
      console.error("checkLiveUpdates error:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [lastUpdated, isRefreshing, isLoading, selectedJob]);

  // Apply staged live updates to feed
  const handleApplyLiveUpdates = () => {
    if (stagedNewJobs.length > 0) {
      setJobs((prev) => [...stagedNewJobs, ...prev]);
      setTotalMatches((prev) => prev + stagedNewJobs.length);
      setStagedNewJobs([]);
    }
    setClosedCount(0);
    setUpdatedCount(0);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleDismissLivePill = () => {
    setStagedNewJobs([]);
    setClosedCount(0);
    setUpdatedCount(0);
  };

  // Toggle Save Job
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
    } catch (e) {
      console.error("handleToggleSave error:", e);
    }
  };

  const handleCreateSimilarAlert = (job: JobItem) => {
    router.push(`/alerts?name=${encodeURIComponent(`${job.title} at ${job.companyName}`)}&skills=${encodeURIComponent(job.skills?.join(",") || "")}&location=${encodeURIComponent(job.location || "")}`);
  };

  const handleQuickFilter = (key: string, value: string) => {
    if (key === "locations") {
      setFilters((prev) => ({
        ...prev,
        locations: prev.locations.includes(value) ? prev.locations : [...prev.locations, value],
        page: 1,
      }));
    } else if (key === "experienceLevels") {
      setFilters((prev) => ({
        ...prev,
        experienceLevels: prev.experienceLevels.includes(value) ? prev.experienceLevels : [...prev.experienceLevels, value],
        page: 1,
      }));
    } else if (key === "postedWithin") {
      setFilters((prev) => ({ ...prev, postedWithin: value, page: 1 }));
    }
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen">
      {/* 1. Hero Search Section */}
      <HeroSearch
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q, page: 1 }))}
        onSelectQuickFilter={handleQuickFilter}
        onCreateAlert={() => router.push("/alerts")}
        discoveredLastHour={discoveredLastHour}
        sourcesMonitored={activeSourcesCount || 4}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Live Status Bar */}
        <div className="mb-4">
          <LiveStatusBar
            lastUpdated={lastUpdated}
            onRefresh={checkLiveUpdates}
            isRefreshing={isRefreshing}
            refreshIntervalSeconds={60}
          />
        </div>

        {/* Floating Real-Time Update Pill */}
        <LiveUpdatePill
          newCount={stagedNewJobs.length}
          closedCount={closedCount}
          updatedCount={updatedCount}
          onApply={handleApplyLiveUpdates}
          onDismiss={handleDismissLivePill}
        />

        {/* Split Grid: Left Filters + Right Feed */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Filter Panel */}
          <FilterPanel
            filters={filters}
            onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
            onReset={handleResetFilters}
            totalResults={totalMatches}
          />

          {/* Right Live Job Feed */}
          <div className="flex-1 w-full min-w-0">
            {/* Feed Control Bar: Match count + Sort By */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800/80 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <span className="text-zinc-500 dark:text-zinc-500 font-semibold">FEED STREAM:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalMatches}</span>
                <span className="text-zinc-600 dark:text-zinc-400">active opportunities</span>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                <span className="text-zinc-500 dark:text-zinc-500">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as any,
                      page: 1,
                    }))
                  }
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-xs font-mono shadow-sm"
                >
                  <option value="newest">Newest first (Default)</option>
                  <option value="best_match">Best match</option>
                  <option value="highest_salary">Highest salary</option>
                  <option value="lowest_exp">Lowest experience</option>
                </select>
              </div>
            </div>

            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 animate-pulse shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800/40 rounded w-full mb-2"></div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800/40 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyFeedState onReset={handleResetFilters} />
            ) : (
              <div className="space-y-3.5">
                {jobs.map((job) => (
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
          </div>
        </div>
      </div>

      {/* Slide-over / Modal Detail View */}
      <JobDetailModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobIds.has(selectedJob.id) : false}
        onToggleSave={handleToggleSave}
        onCreateSimilarAlert={handleCreateSimilarAlert}
      />
    </div>
  );
}