import Link from "next/link";

interface BrandLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ showTagline = false, size = "md" }: BrandLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
      <div className={`${iconSizes[size]} flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors shadow-sm`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-emerald-600 dark:text-emerald-400">
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.15"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold tracking-tight ${textSizes[size]} text-zinc-900 dark:text-white font-mono`}>
          JOB<span className="text-emerald-600 dark:text-emerald-400">STREAM</span>
        </span>
        {showTagline && (
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal -mt-0.5">
            Don&apos;t search for jobs. Let the jobs find you.
          </span>
        )}
      </div>
    </Link>
  );
}