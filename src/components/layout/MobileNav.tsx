"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PRIMARY_NAV_LINKS, 
  ACCOUNT_NAV_LINKS, 
  isRouteActive 
} from "./nav-config";
import { 
  Radio, 
  Compass, 
  Bookmark, 
  Bell, 
  User, 
  X, 
  Check, 
  ShieldCheck, 
  LayoutDashboard 
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const getPrimaryIcon = (href: string) => {
    switch (href) {
      case "/":
        return Radio;
      case "/explore":
        return Compass;
      case "/saved":
        return Bookmark;
      case "/alerts":
        return Bell;
      default:
        return Radio;
    }
  };

  const isAccountActive = ACCOUNT_NAV_LINKS.some((item) => isRouteActive(pathname, item.href));

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-lg px-2 py-1 transition-colors duration-150"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="flex items-center justify-around">
          {PRIMARY_NAV_LINKS.map((item) => {
            const Icon = getPrimaryIcon(item.href);
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  active
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`w-4 h-4 mb-1 ${active ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Account / More Trigger */}
          <button
            type="button"
            onClick={() => setIsSheetOpen(!isSheetOpen)}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
              isAccountActive || isSheetOpen
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
            }`}
            aria-expanded={isSheetOpen}
            aria-label="Open account navigation"
          >
            <User className={`w-4 h-4 mb-1 ${isAccountActive || isSheetOpen ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`} />
            <span>Account</span>
          </button>
        </div>
      </nav>

      {/* Mobile Account Bottom Sheet */}
      {isSheetOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setIsSheetOpen(false)}
        >
          <div
            className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 rounded-t-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  AC
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">Alex Chen</h3>
                  <p className="text-[11px] text-zinc-500 font-mono">alex@jobstream.io</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                aria-label="Close sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Accessible Navigation Links */}
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsSheetOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isRouteActive(pathname, "/profile")
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold border border-zinc-200 dark:border-zinc-800"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <span>Search Profile & Matching</span>
                {isRouteActive(pathname, "/profile") && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsSheetOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isRouteActive(pathname, "/dashboard")
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold border border-zinc-200 dark:border-zinc-800"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <span>Candidate Dashboard</span>
                {isRouteActive(pathname, "/dashboard") && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsSheetOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isRouteActive(pathname, "/admin")
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold border border-zinc-200 dark:border-zinc-800"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <span>Admin & Telemetry Console</span>
                {isRouteActive(pathname, "/admin") && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}