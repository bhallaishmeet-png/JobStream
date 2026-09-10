"use client";

import { Zap, X } from "lucide-react";

interface LiveUpdatePillProps {
  newCount: number;
  closedCount: number;
  updatedCount: number;
  onApply: () => void;
  onDismiss: () => void;
}

export function LiveUpdatePill({
  newCount,
  closedCount,
  updatedCount,
  onApply,
  onDismiss,
}: LiveUpdatePillProps) {
  if (newCount === 0 && closedCount === 0 && updatedCount === 0) {
    return null;
  }

  return (
    <div className="sticky top-20 z-30 flex items-center justify-center my-3 animate-slide-down">
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/95 border border-emerald-500/50 shadow-lg shadow-emerald-500/10 backdrop-blur-md text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-200">
          {newCount > 0 && (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              {newCount} new {newCount === 1 ? "job" : "jobs"}
            </span>
          )}

          {closedCount > 0 && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-rose-400 font-medium">
                🔴 {closedCount} closed
              </span>
            </>
          )}

          {updatedCount > 0 && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-cyan-400 font-medium">
                ♻️ {updatedCount} updated
              </span>
            </>
          )}
        </div>

        <button
          onClick={onApply}
          className="px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] transition-colors shadow"
        >
          Show updates
        </button>

        <button
          onClick={onDismiss}
          className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded-full hover:bg-zinc-800 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}