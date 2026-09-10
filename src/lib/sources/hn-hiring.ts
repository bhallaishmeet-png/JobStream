import { JobSourceAdapter, RawDiscoveredJob } from "./adapter.interface";

export const HN_SOURCE_ID = "hacker-news-hiring";
export const HN_SOURCE_NAME = "Hacker News: Who is Hiring?";

export class HackerNewsHiringAdapter implements JobSourceAdapter {
  id = HN_SOURCE_ID;
  name = HN_SOURCE_NAME;
  type = "API" as const;
  endpoint = "https://hn.algolia.com/api/v1/search_by_date?query=hiring&tags=comment&hitsPerPage=10";

  async fetchJobs(): Promise<RawDiscoveredJob[]> {
    try {
      const response = await fetch(this.endpoint, {
        headers: {
          "User-Agent": "JOBSTREAM-Discovery-Bot/1.0",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`HackerNews API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data?.hits || !Array.isArray(data.hits)) return [];

      const parsedJobs: RawDiscoveredJob[] = [];

      for (const hit of data.hits) {
        const text = (hit.comment_text || "").replace(/<[^>]*>?/gm, " ").trim();
        // Skip very short comments or comments that don't match typical hiring post format
        if (text.length < 100) continue;

        // HN comments usually start like: "CompanyName | Role | Location | Remote/Onsite"
        const firstLine = text.split("\n")[0].trim();
        const parts = firstLine.split(/\||-/).map((p: string) => p.trim());

        const companyName = parts[0]?.slice(0, 40) || "Y Combinator Startup";
        const title = parts[1]?.slice(0, 60) || "Software Engineer";
        const locationPart = parts[2]?.slice(0, 40) || (text.toLowerCase().includes("remote") ? "Remote" : "San Francisco, CA");

        const sourceJobId = `hn-${hit.objectID}`;
        const canonicalUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
        const pubDate = hit.created_at ? new Date(hit.created_at) : new Date();

        const skillsPool = ["React", "TypeScript", "Python", "Go", "Rust", "PostgreSQL", "AWS", "AI", "LLMs", "C++"];
        const matchedSkills = skillsPool.filter(s =>
          new RegExp(`\\b${s}\\b`, "i").test(text)
        );

        parsedJobs.push({
          sourceJobId,
          title,
          companyName,
          companyLogo: `https://avatar.vercel.sh/${encodeURIComponent(companyName)}.svg?text=HN`,
          location: locationPart,
          workMode: text.toLowerCase().includes("remote") ? "REMOTE" : "HYBRID",
          experienceLevel: title.toLowerCase().includes("senior") ? "3-5" : "1-2",
          jobType: "FULL_TIME",
          salaryCurrency: "USD",
          salaryPeriod: "YEAR",
          description: text.slice(0, 1200),
          responsibilities: ["Build core product capabilities at early stage", "Collaborate directly with founding engineering team"],
          requirements: ["Strong software engineering fundamentals", "Pragmatic problem solver comfortable in fast-moving environments"],
          benefits: ["Competitive equity", "Health insurance", "Direct founder impact"],
          skills: matchedSkills.length > 0 ? matchedSkills : ["Startups", "Full Stack"],
          canonicalUrl,
          applyUrl: canonicalUrl,
          postedAt: pubDate,
          isDemo: false,
        });

        if (parsedJobs.length >= 6) break;
      }

      return parsedJobs;
    } catch (err: any) {
      console.warn("HackerNews API fetch warning:", err.message);
      return [];
    }
  }

  async checkJobStatus(): Promise<"ACTIVE" | "CLOSED" | "EXPIRED" | "UNKNOWN"> {
    return "ACTIVE";
  }
}
