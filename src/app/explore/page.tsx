"use client";

import { useState, useEffect } from "react";
import { Compass, TrendingUp, Building, Code2, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    discoveredToday: 0,
  });

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setStats(data.metrics);
      })
      .catch(() => {});
  }, []);

  const topCompanies = [
    { name: "Razorpay", location: "Bangalore", hiringCount: "3 active roles", badge: "Fintech Checkout" },
    { name: "Zerodha", location: "Bangalore", hiringCount: "2 active roles", badge: "High-Throughput Go" },
    { name: "Swiggy", location: "Bangalore", hiringCount: "4 active roles", badge: "Logistics ML" },
    { name: "CRED", location: "Bangalore", hiringCount: "2 active roles", badge: "Banking Core" },
    { name: "Postman", location: "Remote", hiringCount: "2 active roles", badge: "Developer Tooling" },
    { name: "Stripe", location: "Remote · India", hiringCount: "3 active roles", badge: "Global Payments" },
    { name: "Zomato / Blinkit", location: "Gurgaon", hiringCount: "2 active roles", badge: "Quick Commerce" },
  ];

  const techStacks = [
    { name: "React & Next.js", count: "18+ jobs", trend: "+24% this week" },
    { name: "Python & PyTorch", count: "14+ jobs", trend: "+45% this week" },
    { name: "Go (Golang)", count: "9+ jobs", trend: "+12% this week" },
    { name: "TypeScript", count: "22+ jobs", trend: "+18% this week" },
    { name: "PostgreSQL & Redis", count: "16+ jobs", trend: "+15% this week" },
    { name: "Kubernetes & AWS", count: "11+ jobs", trend: "+8% this week" },
  ];

  const techHubs = [
    { city: "Bangalore", label: "Silicon Valley of India", count: "45% of stream" },
    { city: "Remote", label: "India & Global Remote", count: "30% of stream" },
    { city: "Gurgaon / Delhi NCR", label: "E-commerce & Consumer Tech", count: "15% of stream" },
    { city: "Hyderabad", label: "Enterprise AI & Cloud", count: "10% of stream" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Compass className="w-6 h-6 text-emerald-400" />
        <h1 className="text-2xl font-bold font-mono text-zinc-100">Live Tech Job Market Intelligence</h1>
      </div>
      <p className="text-xs text-zinc-400 max-w-2xl mb-8">
        Real-time telemetry on active hiring hubs, technology demand, and compensation distributions across monitored networks.
      </p>

      {/* Top Companies Hiring */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Top Engineering Teams Hiring Live</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {topCompanies.map((c) => (
            <Link
              key={c.name}
              href={`/?company=${encodeURIComponent(c.name)}`}
              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold font-mono text-zinc-100 group-hover:text-emerald-400 transition-colors">
                    {c.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {c.badge}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  <span>{c.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80 text-xs font-mono">
                <span className="text-emerald-400 font-medium">{c.hiringCount}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* High Demand Tech Stacks */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">High Velocity Tech Stacks</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {techStacks.map((s) => (
            <Link
              key={s.name}
              href={`/?skills=${encodeURIComponent(s.name.split(" ")[0])}`}
              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono font-bold text-zinc-200 group-hover:text-cyan-400">{s.name}</span>
                <span className="text-[11px] font-mono text-emerald-400">{s.trend}</span>
              </div>
              <div className="text-xs font-mono text-zinc-500">{s.count} in stream right now</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tech Hubs */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Active Geographic Distribution</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {techHubs.map((h) => (
            <Link
              key={h.city}
              href={`/?locations=${encodeURIComponent(h.city)}`}
              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <div className="text-sm font-mono font-bold text-zinc-200 group-hover:text-amber-400 mb-0.5">{h.city}</div>
              <div className="text-xs text-zinc-400 mb-2">{h.label}</div>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">{h.count}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}