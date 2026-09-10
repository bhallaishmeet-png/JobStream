"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`} 
        aria-hidden="true" 
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors duration-150 shadow-sm cursor-pointer ${className}`}
      aria-label={isDark ? "Switch to light mode (currently dark)" : "Switch to dark mode (currently light)"}
      title={isDark ? "Dark theme active. Click to switch to Light mode." : "Light theme active. Click to switch to Dark mode."}
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-emerald-400 transition-transform duration-200" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200" />
      )}
      {showLabel && (
        <span className="text-xs font-mono font-medium">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  );
}
