import { SearchX, RotateCcw } from "lucide-react";

interface EmptyFeedStateProps {
  onReset: () => void;
}

export function EmptyFeedState({ onReset }: EmptyFeedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800/80 my-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center mb-4 text-zinc-400">
        <SearchX className="w-6 h-6 text-zinc-500" />
      </div>

      <h3 className="text-base font-bold text-zinc-100 mb-1 font-mono">
        No fresh jobs match your filters.
      </h3>
      <p className="text-xs text-zinc-400 max-w-sm mb-5">
        We continuously poll verified sources every 60 seconds. In the meantime, try broadening your query:
      </p>

      <ul className="text-xs text-zinc-400 text-left list-disc list-inside space-y-1 mb-6 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/60 max-w-xs">
        <li>Removing a restrictive location</li>
        <li>Increasing the experience range</li>
        <li>Expanding the posting window (e.g. 24h or 7d)</li>
      </ul>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset Filters</span>
      </button>
    </div>
  );
}