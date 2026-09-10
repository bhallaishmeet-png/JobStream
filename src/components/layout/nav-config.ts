export interface NavItem {
  label: string;
  href: string;
}

export const PRIMARY_NAV_LINKS: NavItem[] = [
  { label: "Live Jobs", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Saved", href: "/saved" },
  { label: "Alerts", href: "/alerts" },
];

export const ACCOUNT_NAV_LINKS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Admin Console", href: "/admin" },
  { label: "Search Profile", href: "/profile" },
];

export const ALL_NAV_LINKS: NavItem[] = [
  ...PRIMARY_NAV_LINKS,
  ...ACCOUNT_NAV_LINKS,
];

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/jobs/");
  }
  return pathname === href || pathname.startsWith(href + "/");
}
