"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Zap } from "lucide-react";

interface LiveStatusBarProps {
  lastUpdated: Date;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshIntervalSeconds?: number;
}

export function LiveStatusBar({
  lastUpdated,
  onRefresh,
  isRefreshing,
  refreshIntervalSeconds = 60,
}: LiveStatusBarProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(refreshIntervalSeconds);

  useEffect(() => {
    const updateTimes = () => {
      const diffSec = Math.floor(Math.max(0, Date.now() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(diffSec);

      const remaining = Math.max(0, refreshIntervalSeconds - (diffSec % refreshIntervalSeconds));
      setSecondsLeft(remaining);

      // If countdown hits 0, trigger refresh
      if (remaining === 0 && !isRefreshing) {
        onRefresh();
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated, refreshIntervalSeconds, onRefresh, isRefreshing]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 shadow-sm font-mono text-xs">
      <div className="flex items-center gap-3">
        {/* Pulsing Green LIVE indicator */}
        <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>LIVE</span>
        </div>

        {/* Dynamic Relative Timestamps */}
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="text-zinc-400">Last updated:</span>
          <span className="text-zinc-100 font-semibold">
            {secondsAgo === 0 ? "Just now" : `${secondsAgo} seconds ago`}
          </span>
        </div>

        <span className="hidden sm:inline text-zinc-600">•</span>

        <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
          <span>Next update in:</span>
          <span className="text-emerald-400 font-semibold">{secondsLeft}s</span>
        </div>
      </div>

      {/* Manual refresh button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/80 transition-colors disabled:opacity-50"
        title="Check for new updates now"
      >
        <RefreshCw className={`w-3 h-3 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
        <span className="hidden md:inline">Check Now</span>
      </button>
    </div>
  );
}