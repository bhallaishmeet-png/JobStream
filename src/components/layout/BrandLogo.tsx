import Link from "next/link";

interface BrandLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ showTagline = false, size = "md" }: BrandLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="inline-flex items-center gap-3 group select-none">
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 group-hover:border-emerald-500/60 transition-colors shadow-sm`}>
        {/* Stream / Pulse mark */}
        <svg viewBox="0 0 24 24" fill="none" className="w-4/5 h-4/5 text-emerald-500 dark:text-emerald-400 transform group-hover:scale-110 transition-transform">
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Streaming pulse lines */}
          <path
            d="M3 7H1M23 17H21"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight ${textSizes[size]} text-zinc-900 dark:text-white font-mono`}>
            JOB<span className="text-emerald-500 dark:text-emerald-400">STREAM</span>
          </span>
          <span className="px-1.5 py-0.2 text-[10px] uppercase font-mono font-bold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded">
            LIVE
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium -mt-0.5">
            Don&apos;t search for jobs. Let the jobs find you.
          </span>
        )}
      </div>
    </Link>
  );
}