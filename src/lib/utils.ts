import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(
  minSalary?: number | null,
  maxSalary?: number | null,
  currency: string = "INR",
  period: string = "YEAR"
): string {
  if (!minSalary && !maxSalary) return "Not disclosed";

  const isINR = currency === "INR";
  const symbol = isINR ? "₹" : "$";

  const formatAmount = (amount: number) => {
    if (isINR) {
      if (period === "MONTH") {
        return `${amount.toLocaleString("en-IN")}/mo`;
      }
      if (amount >= 100000) {
        const lpa = (amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1);
        return `${lpa} LPA`;
      }
      return `${amount.toLocaleString("en-IN")}/yr`;
    } else {
      if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}k/yr`;
      }
      return `${amount}/yr`;
    }
  };

  if (minSalary && maxSalary) {
    if (minSalary === maxSalary) {
      return `${symbol}${formatAmount(minSalary)}`;
    }
    return `${symbol}${formatAmount(minSalary)} to ${symbol}${formatAmount(maxSalary)}`;
  } else if (minSalary) {
    return `${symbol}${formatAmount(minSalary)}+`;
  } else if (maxSalary) {
    return `Up to ${symbol}${formatAmount(maxSalary)}`;
  }
  return "Competitive";
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateCanonicalKey(company: string, title: string, location: string): string {
  const normComp = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normTitle = title
    .toLowerCase()
    .replace(/\b(senior|sr|junior|jr|lead|staff|intern|principal)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
  const normLoc = location.toLowerCase().includes("remote") ? "remote" : location.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${normComp}::${normTitle}::${normLoc}`;
}
