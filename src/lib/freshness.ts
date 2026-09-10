export interface FreshnessMeta {
  score: number;
  emoji: string;
  badgeColor: string;
  textColor: string;
  label: string;
}

export function calculateFreshness(dateInput: string | Date | number): FreshnessMeta {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) {
    return {
      score: 99,
      emoji: "",
      badgeColor: "bg-orange-500/10 border-orange-500/30",
      textColor: "text-orange-400",
      label: "Just now",
    };
  } else if (diffMin < 5) {
    return {
      score: 96,
      emoji: "",
      badgeColor: "bg-orange-500/10 border-orange-500/30",
      textColor: "text-orange-400",
      label: `${diffMin}m ago`,
    };
  } else if (diffMin < 30) {
    return {
      score: 85,
      emoji: "",
      badgeColor: "bg-amber-500/10 border-amber-500/30",
      textColor: "text-amber-400",
      label: `${diffMin}m ago`,
    };
  } else if (diffHours < 3) {
    return {
      score: 65,
      emoji: "",
      badgeColor: "bg-amber-500/10 border-amber-500/30",
      textColor: "text-amber-400",
      label: `${diffHours}h ago`,
    };
  } else if (diffHours < 24) {
    return {
      score: 50,
      emoji: "",
      badgeColor: "bg-zinc-800 border-zinc-700",
      textColor: "text-zinc-300",
      label: `${diffHours}h ago`,
    };
  } else if (diffDays < 7) {
    return {
      score: 30,
      emoji: "",
      badgeColor: "bg-zinc-800 border-zinc-700",
      textColor: "text-zinc-400",
      label: `${diffDays}d ago`,
    };
  } else {
    return {
      score: 15,
      emoji: "",
      badgeColor: "bg-zinc-800 border-zinc-700",
      textColor: "text-zinc-500",
      label: `${diffDays}d ago`,
    };
  }
}

export function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor(Math.max(0, now.getTime() - date.getTime()) / 1000);

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}
