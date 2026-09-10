import { XMLParser } from "fast-xml-parser";
import { JobSourceAdapter, RawDiscoveredJob } from "./adapter.interface";

export const WWR_SOURCE_ID = "weworkremotely-rss";
export const WWR_SOURCE_NAME = "WeWorkRemotely RSS";

export class WeWorkRemotelyAdapter implements JobSourceAdapter {
  id = WWR_SOURCE_ID;
  name = WWR_SOURCE_NAME;
  type = "RSS" as const;
  endpoint = "https://weworkremotely.com/categories/remote-programming-jobs.rss";

  async fetchJobs(): Promise<RawDiscoveredJob[]> {
    try {
      const response = await fetch(this.endpoint, {
        headers: {
          "User-Agent": "JOBSTREAM-Discovery-Bot/1.0 (+https://jobstream.app/bot)",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`WWR RSS feed returned status ${response.status}`);
      }

      const xmlText = await response.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const parsed = parser.parse(xmlText);
      const items = parsed?.rss?.channel?.item;

      if (!items || !Array.isArray(items)) {
        return [];
      }

      return items.slice(0, 20).map((item: any) => {
        const rawTitle = String(item.title || "Software Engineer");
        // Title in WWR is often formatted as: "Company Name: Job Title"
        let companyName = "Remote Tech Company";
        let title = rawTitle;

        if (rawTitle.includes(":")) {
          const parts = rawTitle.split(":");
          companyName = parts[0].trim();
          title = parts.slice(1).join(":").trim();
        }

        const canonicalUrl = String(item.link || item.guid || "");
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        const description = String(item.description || "").replace(/<[^>]*>?/gm, "").slice(0, 1000);

        // Extract skills heuristically from description
        const skillsPool = ["React", "TypeScript", "Node.js", "Python", "Go", "Ruby", "PostgreSQL", "AWS", "Docker", "GraphQL", "Kubernetes", "Next.js"];
        const matchedSkills = skillsPool.filter(s =>
          new RegExp(`\\b${s}\\b`, "i").test(description) || new RegExp(`\\b${s}\\b`, "i").test(title)
        );

        return {
          sourceJobId: `wwr-${Buffer.from(canonicalUrl).toString("base64").slice(0, 16)}`,
          title,
          companyName,
          companyLogo: `https://avatar.vercel.sh/${encodeURIComponent(companyName)}.svg?text=${encodeURIComponent(companyName.slice(0, 2).toUpperCase())}`,
          location: "Remote",
          workMode: "REMOTE" as const,
          experienceLevel: title.toLowerCase().includes("senior") ? "3-5" : title.toLowerCase().includes("lead") ? "5-10" : "1-2",
          jobType: "FULL_TIME" as const,
          salaryCurrency: "USD",
          salaryPeriod: "YEAR",
          description: description || "Exciting remote engineering role at an innovative global company.",
          responsibilities: [
            "Contribute to scalable cloud services and maintain high code quality standards",
            "Collaborate closely with distributed cross-functional product teams",
          ],
          requirements: [
            "Experience with modern software development methodologies",
            "Strong communication and autonomous problem-solving capabilities",
          ],
          benefits: ["Remote work flexibility", "Competitive compensation", "Global team environment"],
          skills: matchedSkills.length > 0 ? matchedSkills : ["Remote", "Software Engineering"],
          canonicalUrl,
          applyUrl: canonicalUrl,
          postedAt: pubDate,
          isDemo: false,
        };
      });
    } catch (err: any) {
      console.warn("WeWorkRemotely RSS fetch warning:", err.message);
      return [];
    }
  }

  async checkJobStatus(sourceJobId: string, canonicalUrl: string): Promise<"ACTIVE" | "CLOSED" | "EXPIRED" | "UNKNOWN"> {
    try {
      const res = await fetch(canonicalUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      if (res.status === 404 || res.status === 410) return "CLOSED";
      return "ACTIVE";
    } catch {
      return "ACTIVE";
    }
  }
}
