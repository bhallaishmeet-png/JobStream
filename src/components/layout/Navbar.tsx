"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "../theme/ThemeToggle";
import { 
  Radio, 
  Bookmark, 
  Bell, 
  LayoutDashboard, 
  Compass, 
  ShieldCheck, 
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: "Live Jobs", href: "/", icon: Radio },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Saved", href: "/saved", icon: Bookmark },
    { label: "Alerts", href: "/alerts", icon: Bell },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Admin", href: "/admin", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <BrandLogo />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-colors ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-zinc-300 dark:border-zinc-700/80 shadow-inner"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Telemetry + Theme Switcher + Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-full font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-500 dark:text-zinc-400">TELEMETRY:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FEED ACTIVE</span>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              AC
            </div>
            <span className="hidden sm:inline">Alex Chen</span>
          </Link>
        </div>
      </div>
    </header>
  );
}