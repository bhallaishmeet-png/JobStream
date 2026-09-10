"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  Layers, 
  Zap, 
  Radio
} from "lucide-react";

interface AdminData {
  metrics: {
    totalJobs: number;
    activeJobs: number;
    closedJobs: number;
    discoveredToday: number;
    discoveredThisHour: number;
    duplicateJobsDetected: number;
    averageFreshness: number;
    activeSources: number;
    totalSources: number;
  };
  sources: {
    id: string;
    name: string;
    type: string;
    status: "HEALTHY" | "DELAYED" | "ERROR";
    isEnabled: boolean;
    lastSyncAt: string | null;
    errorCount: number;
    lastErrorMessage: string | null;
    totalJobs: number;
  }[];
  recentCrawlRuns: {
    id: string;
    sourceName: string;
    startedAt: string;
    completedAt: string | null;
    status: string;
    discovered: number;
    updated: number;
    closed: number;
    errorMessage: string | null;
  }[];
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      const resData = await res.json();
      setActionMessage("Sync completed across all authorized source adapters.");
      loadData();
    } catch (e) {
      setActionMessage("Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSimulateEvent = async () => {
    setIsSimulating(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate" }),
      });
      const resData = await res.json();
      if (resData.result) {
        setActionMessage(`Live event simulated: ${resData.result.message}`);
      }
      loadData();
    } catch (e) {
      setActionMessage("Simulation failed.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleToggleSource = async (id: string, current: boolean) => {
    try {
      await fetch("/api/sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isEnabled: !current }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) {
    return <div className="text-center py-16 text-xs font-mono text-zinc-500">Loading Telemetry...</div>;
  }

  const { metrics, sources, recentCrawlRuns } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold font-mono text-zinc-100">Telemetry & Source Operations</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Monitor pipeline health, trigger ingestion syncs, and simulate real-time market lifecycle events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateEvent}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold font-mono transition-colors disabled:opacity-50"
            title="Inject 1 new job and close 1 older job to verify live updates"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            <span>Simulate Live Event</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync All Sources</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-3 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500">TOTAL DISCOVERED</span>
          <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">{metrics.totalJobs}</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500">ACTIVE IN STREAM</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{metrics.activeJobs}</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500">CLOSED / EXPIRED</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{metrics.closedJobs}</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500">DUPLICATES CLUSTERED</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{metrics.duplicateJobsDetected}</div>
        </div>
      </div>

      {/* Source Health Table */}
      <div className="mb-10 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Source Health Monitor</h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">{sources.filter((s) => s.isEnabled).length} of {sources.length} Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Source Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Health Status</th>
                <th className="p-3.5">Total Jobs</th>
                <th className="p-3.5">Errors</th>
                <th className="p-3.5 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3.5 font-semibold text-zinc-200">
                    {s.name}
                  </td>
                  <td className="p-3.5 text-zinc-400">{s.type}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      {s.status === "HEALTHY" && (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Healthy</span>
                        </>
                      )}
                      {s.status === "DELAYED" && (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400 font-bold">Delayed</span>
                        </>
                      )}
                      {s.status === "ERROR" && (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400 font-bold">Error</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">{s.totalJobs}</td>
                  <td className="p-3.5 text-zinc-400">{s.errorCount}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleToggleSource(s.id, s.isEnabled)}
                      className={`px-3 py-1 rounded text-[11px] border transition-colors ${
                        s.isEnabled
                          ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {s.isEnabled ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingestion Crawl Log */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Recent Ingestion Crawl Runs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Source</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Discovered</th>
                <th className="p-3.5">Updated</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {recentCrawlRuns.slice(0, 8).map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/40">
                  <td className="p-3.5 font-semibold text-zinc-200">{r.sourceName}</td>
                  <td className="p-3.5 text-zinc-400">{new Date(r.startedAt).toLocaleTimeString()}</td>
                  <td className="p-3.5 text-emerald-400 font-bold">+{r.discovered}</td>
                  <td className="p-3.5 text-cyan-400">~{r.updated}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      r.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}