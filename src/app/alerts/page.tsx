"use client";

import { useState, useEffect } from "react";
import { AlertItem } from "@/lib/types";
import { Bell, Plus, Trash2, Check, ShieldCheck, Mail, Globe, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [alertName, setAlertName] = useState("AI & Frontend Remote Roles");
  const [location, setLocation] = useState("Remote");
  const [experience, setExperience] = useState("0-1");
  const [skills, setSkills] = useState("React, Python, AI");
  const [jobType, setJobType] = useState("FULL_TIME");
  const [emailNotification, setEmailNotification] = useState(true);
  const [browserNotification, setBrowserNotification] = useState(true);

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertName.trim()) return;

    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: alertName,
          filters: {
            locations: location ? [location] : [],
            experienceLevels: experience ? [experience] : [],
            jobTypes: jobType ? [jobType] : [],
            skills: skillsArray,
          },
          frequency: "REALTIME",
          emailNotification,
          browserNotification,
        }),
      });

      if (res.ok) {
        setIsCreating(false);
        loadAlerts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isEnabled: !current }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isEnabled: !current } : a))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold font-mono text-zinc-100">Job Alert Engine</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Get notified instantly the second a matching job is discovered across monitored networks.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Alert</span>
        </button>
      </div>

      {/* New Alert Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateAlert}
          className="mb-8 p-6 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 shadow-2xl space-y-4 text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="font-mono font-bold text-sm text-zinc-100">Set Up Real-time Opportunity Watcher</span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-zinc-500 hover:text-zinc-300 font-mono text-xs"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-zinc-400 font-mono mb-1 font-semibold">Alert Name</label>
            <input
              type="text"
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. AI Internships / Remote React"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 font-mono mb-1">Target Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200"
                placeholder="e.g. Remote, Bangalore, Gurgaon"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-mono mb-1">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200"
              >
                <option value="FRESHER">Fresher</option>
                <option value="0-1">0–1 years</option>
                <option value="1-2">1–2 years</option>
                <option value="2-3">2–3 years</option>
                <option value="3-5">3–5 years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-mono mb-1">Required Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200"
              placeholder="e.g. Python, AI, React, Go"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={emailNotification}
                onChange={(e) => setEmailNotification(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
              />
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>Email notification</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={browserNotification}
                onChange={(e) => setBrowserNotification(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
              />
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>Browser push notification</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-xs transition-colors"
            >
              Activate Real-time Alert
            </button>
          </div>
        </form>
      )}

      {/* Existing Alerts */}
      {isLoading ? (
        <div className="text-center py-12 text-xs font-mono text-zinc-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-zinc-950 border border-zinc-800">
          <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-bold text-zinc-300 mb-1">No active job alerts configured</h3>
          <p className="text-xs text-zinc-500 mb-4">Set up an alert to receive immediate notifications when fresh jobs enter the stream.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold font-mono"
          >
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold font-mono text-zinc-100">{alert.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    alert.isEnabled
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-500"
                  }`}>
                    {alert.isEnabled ? "ACTIVE STREAM" : "PAUSED"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
                  {alert.filters.locations && alert.filters.locations.length > 0 && (
                    <span>📍 {alert.filters.locations.join(", ")}</span>
                  )}
                  {alert.filters.experienceLevels && alert.filters.experienceLevels.length > 0 && (
                    <span>💼 {alert.filters.experienceLevels.join(", ")}</span>
                  )}
                  {alert.filters.skills && alert.filters.skills.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>⚡</span>
                      {alert.filters.skills.map((s) => (
                        <span key={s} className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
                <button
                  onClick={() => handleToggle(alert.id, alert.isEnabled)}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${
                    alert.isEnabled
                      ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {alert.isEnabled ? "Pause" : "Resume"}
                </button>

                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-rose-950/80 border border-zinc-700 hover:border-rose-800 text-zinc-400 hover:text-rose-400"
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}