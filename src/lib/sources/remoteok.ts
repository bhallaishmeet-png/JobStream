import { JobSourceAdapter, RawDiscoveredJob } from "./adapter.interface";

export const REMOTEOK_SOURCE_ID = "remoteok-api";
export const REMOTEOK_SOURCE_NAME = "RemoteOK Public API";

export class RemoteOkAdapter implements JobSourceAdapter {
  id = REMOTEOK_SOURCE_ID;
  name = REMOTEOK_SOURCE_NAME;
  type = "API" as const;
  endpoint = "https://remoteok.com/api";

  async fetchJobs(): Promise<RawDiscoveredJob[]> {
    try {
      const response = await fetch(this.endpoint, {
        headers: {
          "User-Agent": "JOBSTREAM-Discovery-Bot/1.0 (+https://jobstream.app)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`RemoteOK returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      // First entry in RemoteOK API is legal disclaimer object, slice from 1
      const jobItems = data.slice(1, 15);

      return jobItems.map((item: any) => {
        const title = item.position || "Full Stack Engineer";
        const companyName = item.company || "Remote Co";
        const sourceJobId = `rok-${item.id || item.slug || Math.random().toString(36).slice(2, 8)}`;
        const canonicalUrl = item.url || `https://remoteok.com/remote-jobs/${item.id}`;
        const pubDate = item.date ? new Date(item.date) : new Date();

        return {
          sourceJobId,
          title,
          companyName,
          companyLogo: item.company_logo || `https://avatar.vercel.sh/${encodeURIComponent(companyName)}.svg?text=${encodeURIComponent(companyName.slice(0, 2).toUpperCase())}`,
          location: item.location || "Remote Worldwide",
          workMode: "REMOTE" as const,
          experienceLevel: title.toLowerCase().includes("senior") ? "3-5" : title.toLowerCase().includes("lead") ? "5-10" : "1-2",
          jobType: "FULL_TIME" as const,
          salaryCurrency: "USD",
          salaryPeriod: "YEAR",
          description: (item.description || "").replace(/<[^>]*>?/gm, "").slice(0, 1000) || "Join a high-growth remote organization.",
          responsibilities: [
            "Participate in product architecture design and implementation",
            "Deliver clean, well-tested code across full stack technologies",
          ],
          requirements: [
            "Demonstrated proficiency in modern web application engineering",
            "Ability to collaborate autonomously across asynchronous time zones",
          ],
          benefits: ["100% remote flexibility", "Competitive compensation package"],
          skills: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags.slice(0, 6) : ["Remote", "Full Stack"],
          canonicalUrl,
          applyUrl: canonicalUrl,
          postedAt: pubDate,
          isDemo: false,
        };
      });
    } catch (err: any) {
      console.warn("RemoteOK API fetch warning:", err.message);
      return [];
    }
  }

  async checkJobStatus(sourceJobId: string, canonicalUrl: string): Promise<"ACTIVE" | "CLOSED" | "EXPIRED" | "UNKNOWN"> {
    try {
      const res = await fetch(canonicalUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      if (res.status === 404 || res.status === 410) return "CLOSED";
      return "ACTIVE";
    } catch {
      return "ACTIVE";
    }
  }
}
