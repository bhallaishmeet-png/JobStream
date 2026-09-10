import { db } from "../db";
import { JobSourceAdapter } from "./adapter.interface";
import { DemoStreamAdapter, DEMO_SOURCE_ID, DEMO_SOURCE_NAME } from "./demo-stream";
import { WeWorkRemotelyAdapter, WWR_SOURCE_ID, WWR_SOURCE_NAME } from "./weworkremotely";
import { RemoteOkAdapter, REMOTEOK_SOURCE_ID, REMOTEOK_SOURCE_NAME } from "./remoteok";
import { HackerNewsHiringAdapter, HN_SOURCE_ID, HN_SOURCE_NAME } from "./hn-hiring";
import { processCanonicalJob } from "../deduplication/canonicalizer";
import { normalizeTitle } from "../utils";
import { activeAIProvider } from "../ai/provider";

export const ALL_ADAPTERS: JobSourceAdapter[] = [
  new DemoStreamAdapter(),
  new WeWorkRemotelyAdapter(),
  new RemoteOkAdapter(),
  new HackerNewsHiringAdapter(),
];

export async function ensureSourcesInitialized() {
  for (const adapter of ALL_ADAPTERS) {
    const existing = await db.jobSource.findUnique({
      where: { name: adapter.name },
    });

    if (!existing) {
      await db.jobSource.create({
        data: {
          id: adapter.id,
          name: adapter.name,
          type: adapter.type,
          endpoint: adapter.endpoint,
          isEnabled: true,
          status: "HEALTHY",
          errorCount: 0,
        },
      });
    }
  }
}

export interface SyncRunResult {
  sourceName: string;
  discovered: number;
  updated: number;
  closed: number;
  status: "SUCCESS" | "FAILED";
  error?: string;
}

export async function syncAllSources(): Promise<SyncRunResult[]> {
  await ensureSourcesInitialized();
  const results: SyncRunResult[] = [];

  for (const adapter of ALL_ADAPTERS) {
    const sourceRecord = await db.jobSource.findUnique({
      where: { name: adapter.name },
    });

    if (!sourceRecord || !sourceRecord.isEnabled) {
      continue;
    }

    const crawlRun = await db.crawlRun.create({
      data: {
        sourceId: sourceRecord.id,
        startedAt: new Date(),
        status: "RUNNING",
      },
    });

    let discoveredCount = 0;
    let updatedCount = 0;
    let closedCount = 0;

    try {
      const rawJobs = await adapter.fetchJobs();

      for (const raw of rawJobs) {
        // Find existing job by sourceJobId or canonicalUrl
        const existingJob = await db.job.findFirst({
          where: {
            OR: [
              { sourceJobId: raw.sourceJobId },
              { canonicalUrl: raw.canonicalUrl },
            ],
          },
        });

        const skills = raw.skills && raw.skills.length > 0
          ? raw.skills
          : await activeAIProvider.extractSkills(raw.description);

        const aiSummary = await activeAIProvider.summarize(raw.title, raw.companyName, raw.description);

        if (!existingJob) {
          // New Job!
          const newJob = await db.job.create({
            data: {
              title: raw.title,
              normalizedTitle: normalizeTitle(raw.title),
              companyName: raw.companyName,
              location: raw.location,
              workMode: raw.workMode || "REMOTE",
              experienceLevel: raw.experienceLevel || "1-2",
              jobType: raw.jobType || "FULL_TIME",
              minSalary: raw.minSalary || null,
              maxSalary: raw.maxSalary || null,
              salaryCurrency: raw.salaryCurrency || "INR",
              salaryPeriod: raw.salaryPeriod || "YEAR",
              description: raw.description,
              responsibilities: JSON.stringify(raw.responsibilities || []),
              requirements: JSON.stringify(raw.requirements || []),
              benefits: JSON.stringify(raw.benefits || []),
              skills: JSON.stringify(skills),
              status: "ACTIVE",
              sourceId: sourceRecord.id,
              sourceName: adapter.name,
              sourceJobId: raw.sourceJobId,
              canonicalUrl: raw.canonicalUrl,
              applyUrl: raw.applyUrl,
              isDemo: Boolean(raw.isDemo),
              postedAt: raw.postedAt,
              discoveredAt: new Date(),
              lastCheckedAt: new Date(),
              lastUpdatedAt: new Date(),
              freshnessScore: 99,
              aiSummary,
            },
          });

          // Run Canonical Deduplication
          const dedupe = await processCanonicalJob(
            raw.companyName,
            raw.title,
            raw.location,
            newJob.id,
            sourceRecord.id,
            adapter.name,
            raw.canonicalUrl,
            raw
          );

          if (dedupe.canonicalJobId) {
            await db.job.update({
              where: { id: newJob.id },
              data: { canonicalJobId: dedupe.canonicalJobId },
            });
          }

          discoveredCount++;
        } else {
          // Update existing job's lastCheckedAt
          await db.job.update({
            where: { id: existingJob.id },
            data: {
              lastCheckedAt: new Date(),
              lastUpdatedAt: new Date(),
            },
          });
          updatedCount++;
        }
      }

      // Update Crawl Run and Source status
      await db.crawlRun.update({
        where: { id: crawlRun.id },
        data: {
          completedAt: new Date(),
          status: "SUCCESS",
          jobsDiscovered: discoveredCount,
          jobsUpdated: updatedCount,
          jobsClosed: closedCount,
        },
      });

      await db.jobSource.update({
        where: { id: sourceRecord.id },
        data: {
          status: "HEALTHY",
          lastSyncAt: new Date(),
          errorCount: 0,
          lastErrorMessage: null,
        },
      });

      results.push({
        sourceName: adapter.name,
        discovered: discoveredCount,
        updated: updatedCount,
        closed: closedCount,
        status: "SUCCESS",
      });
    } catch (err: any) {
      console.error(`Sync error for source ${adapter.name}:`, err.message);

      await db.crawlRun.update({
        where: { id: crawlRun.id },
        data: {
          completedAt: new Date(),
          status: "FAILED",
          errorMessage: err.message,
        },
      });

      await db.jobSource.update({
        where: { id: sourceRecord.id },
        data: {
          status: "ERROR",
          errorCount: { increment: 1 },
          lastErrorMessage: err.message,
        },
      });

      results.push({
        sourceName: adapter.name,
        discovered: 0,
        updated: 0,
        closed: 0,
        status: "FAILED",
        error: err.message,
      });
    }
  }

  return results;
}

// Interactive Live Simulator Trigger for Real-Time Testing
export async function simulateMarketEvent(): Promise<{
  newJobsAdded: number;
  jobsClosed: number;
  message: string;
}> {
  const titles = [
    { title: "Senior AI Engineer (RAG & Agents)", company: "Anthropic Partner Lab", loc: "Bangalore, India", skills: ["Python", "LLMs", "LangChain", "Vector DBs"] },
    { title: "Staff Rust Engineer (High-Speed Engine)", company: "Nexus Financial", loc: "Remote", skills: ["Rust", "Distributed Systems", "WebAssembly", "C++"] },
    { title: "React / Next.js Product Engineer", company: "Linear App Ecosystem", loc: "Remote", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  ];

  const randomPick = titles[Math.floor(Math.random() * titles.length)];
  const timestamp = new Date();
  const sourceJobId = `live-sim-${Date.now()}`;
  const canonicalUrl = `https://demo.jobstream.io/jobs/${sourceJobId}`;

  // 1. Create a freshly minted job (discovered just now!)
  const demoSource = await db.jobSource.findFirst({ where: { type: "DEMO" } });

  const newJob = await db.job.create({
    data: {
      title: randomPick.title,
      normalizedTitle: normalizeTitle(randomPick.title),
      companyName: randomPick.company,
      location: randomPick.loc,
      workMode: randomPick.loc.includes("Remote") ? "REMOTE" : "HYBRID",
      experienceLevel: "2-3",
      jobType: "FULL_TIME",
      minSalary: 2800000,
      maxSalary: 4500000,
      salaryCurrency: "INR",
      salaryPeriod: "YEAR",
      description: `Newly released live opening at ${randomPick.company}. Looking for world-class talent to lead engineering on our next generation platform. Discovered right now by JOBSTREAM live crawler.`,
      responsibilities: JSON.stringify(["Architect modern resilient services", "Collaborate directly with founders"]),
      requirements: JSON.stringify(["Production experience in relevant tech stack", "Fast execution mindset"]),
      benefits: JSON.stringify(["Top percentile salary", "Generous equity grant", "Flexible hours"]),
      skills: JSON.stringify(randomPick.skills),
      status: "ACTIVE",
      sourceId: demoSource?.id,
      sourceName: "Demo Stream Engine",
      sourceJobId,
      canonicalUrl,
      applyUrl: canonicalUrl,
      isDemo: true,
      postedAt: timestamp,
      discoveredAt: timestamp,
      lastCheckedAt: timestamp,
      lastUpdatedAt: timestamp,
      freshnessScore: 99,
      aiSummary: `Live real-time opportunity at ${randomPick.company} for ${randomPick.title}.`,
    },
  });

  // 2. Select an older active job to close (to demonstrate closed job detection!)
  const oldestActiveJob = await db.job.findFirst({
    where: {
      status: "ACTIVE",
      id: { not: newJob.id },
    },
    orderBy: { postedAt: "asc" },
  });

  let closedCount = 0;
  if (oldestActiveJob) {
    await db.job.update({
      where: { id: oldestActiveJob.id },
      data: {
        status: "CLOSED",
        lastUpdatedAt: new Date(),
      },
    });

    await db.jobStatusHistory.create({
      data: {
        jobId: oldestActiveJob.id,
        previousStatus: "ACTIVE",
        newStatus: "CLOSED",
        reason: "Source confirmed position closed or expired",
      },
    });
    closedCount = 1;
  }

  return {
    newJobsAdded: 1,
    jobsClosed: closedCount,
    message: `Discovered new job "${newJob.title}" at ${newJob.companyName} and closed ${closedCount} older listing.`,
  };
}
