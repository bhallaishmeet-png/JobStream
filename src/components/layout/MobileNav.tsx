"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Compass, Bookmark, Bell, User } from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Radio },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Saved", href: "/saved", icon: Bookmark },
    { label: "Alerts", href: "/alerts", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-lg px-2 py-1 transition-colors duration-150">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className="flex flex-col items-center py-1">
          <ThemeToggle className="scale-90" />
        </div>
      </div>
    </div>
  );
}