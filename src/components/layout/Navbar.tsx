"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "../theme/ThemeToggle";
import { PRIMARY_NAV_LINKS, ACCOUNT_NAV_LINKS, isRouteActive } from "./nav-config";
import { ChevronDown, Check, LogOut, LogIn } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(true);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsAccountOpen(false);
  }, [pathname]);

  const isAccountRouteActive = ACCOUNT_NAV_LINKS.some((item) => isRouteActive(pathname, item.href));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Left: Brand Logo & Horizontal Navigation */}
        <div className="flex items-center gap-8 min-w-0">
          <BrandLogo />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {PRIMARY_NAV_LINKS.map((item) => {
              const active = isRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors ${
                    active
                      ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border border-transparent"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Theme Switch + Profile & Account Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Switch */}
          <ThemeToggle />

          {/* Subtle Separator */}
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

          {/* Profile / Account Controls */}
          <div className="relative" ref={accountMenuRef}>
            {isSignedIn ? (
              <button
                type="button"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                  isAccountOpen || isAccountRouteActive
                    ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-white"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
                }`}
                aria-expanded={isAccountOpen}
                aria-haspopup="true"
                aria-label="User account menu for Alex Chen"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  AC
                </div>
                <span className="hidden sm:inline">Alex Chen</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${
                    isAccountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSignedIn(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-medium transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
            )}

            {/* Account Dropdown Menu */}
            {isAccountOpen && isSignedIn && (
              <div
                className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl z-50 p-1.5 transition-colors duration-150"
                role="menu"
                aria-orientation="vertical"
              >
                {/* Account Details */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Alex Chen</p>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono truncate">alex@jobstream.io</p>
                </div>

                <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1" />

                {/* Secondary Account Navigation */}
                <div className="space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setIsAccountOpen(false)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isRouteActive(pathname, "/profile")
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                    role="menuitem"
                  >
                    <span>Profile & Preferences</span>
                    {isRouteActive(pathname, "/profile") && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsAccountOpen(false)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isRouteActive(pathname, "/dashboard")
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                    role="menuitem"
                  >
                    <span>Dashboard</span>
                    {isRouteActive(pathname, "/dashboard") && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsAccountOpen(false)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isRouteActive(pathname, "/admin")
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                    role="menuitem"
                  >
                    <span>Admin Console</span>
                    {isRouteActive(pathname, "/admin") && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </Link>
                </div>

                <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1" />

                {/* Account Controls: Sign out */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignedIn(false);
                    setIsAccountOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <span>Sign out</span>
                  <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}