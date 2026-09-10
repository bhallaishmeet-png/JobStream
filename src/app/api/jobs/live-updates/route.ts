export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateFreshness } from "@/lib/freshness";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get("since");
    const knownIdsParam = searchParams.get("knownIds");

    const sinceDate = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 65 * 1000);
    const knownIds = knownIdsParam ? knownIdsParam.split(",").filter(Boolean) : [];

    // 1. Fetch newly discovered or newly posted active jobs
    const newJobsRaw = await db.job.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { discoveredAt: { gt: sinceDate } },
          { postedAt: { gt: sinceDate } },
        ],
        ...(knownIds.length > 0 ? { id: { notIn: knownIds } } : {}),
      },
      orderBy: { postedAt: "desc" },
      take: 20,
      include: {
        canonicalJob: {
          include: { sources: true },
        },
      },
    });

    // 2. Check for closed/removed jobs among the known IDs that client currently has
    const closedJobIds: string[] = [];
    if (knownIds.length > 0) {
      const closedJobs = await db.job.findMany({
        where: {
          id: { in: knownIds },
          status: { not: "ACTIVE" },
        },
        select: { id: true },
      });
      closedJobIds.push(...closedJobs.map((j) => j.id));
    }

    // 3. Check for updated jobs among known IDs
    const updatedJobsRaw = knownIds.length > 0
      ? await db.job.findMany({
          where: {
            id: { in: knownIds },
            status: "ACTIVE",
            lastUpdatedAt: { gt: sinceDate },
          },
          include: {
            canonicalJob: {
              include: { sources: true },
            },
          },
        })
      : [];

    // Metrics for live status
    const [totalActiveCount, discoveredLastHour, activeSourcesCount] = await Promise.all([
      db.job.count({ where: { status: "ACTIVE" } }),
      db.job.count({
        where: {
          discoveredAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      }),
      db.jobSource.count({ where: { isEnabled: true } }),
    ]);

    const formatJobItem = (job: any) => {
      const freshness = calculateFreshness(job.postedAt);
      return {
        id: job.id,
        canonicalJobId: job.canonicalJobId,
        companyId: job.companyId,
        sourceId: job.sourceId,
        title: job.title,
        normalizedTitle: job.normalizedTitle,
        companyName: job.companyName,
        companyLogo: `https://avatar.vercel.sh/${encodeURIComponent(job.companyName)}.svg?text=${encodeURIComponent(job.companyName.slice(0, 2).toUpperCase())}`,
        location: job.location,
        city: job.city,
        country: job.country,
        workMode: job.workMode,
        experienceLevel: job.experienceLevel,
        jobType: job.jobType,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        salaryCurrency: job.salaryCurrency,
        salaryPeriod: job.salaryPeriod,
        description: job.description,
        responsibilities: JSON.parse(job.responsibilities || "[]"),
        requirements: JSON.parse(job.requirements || "[]"),
        benefits: JSON.parse(job.benefits || "[]"),
        skills: JSON.parse(job.skills || "[]"),
        status: job.status,
        sourceName: job.sourceName,
        sourceJobId: job.sourceJobId,
        canonicalUrl: job.canonicalUrl,
        applyUrl: job.applyUrl,
        isDemo: job.isDemo,
        discoveredAt: job.discoveredAt.toISOString(),
        postedAt: job.postedAt.toISOString(),
        lastCheckedAt: job.lastCheckedAt.toISOString(),
        lastUpdatedAt: job.lastUpdatedAt.toISOString(),
        freshnessScore: freshness.score,
        aiSummary: job.aiSummary,
        totalSources: job.canonicalJob?.totalSources || 1,
      };
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      newJobs: newJobsRaw.map(formatJobItem),
      closedJobIds,
      updatedJobs: updatedJobsRaw.map(formatJobItem),
      totalActiveCount,
      discoveredLastHour,
      activeSourcesCount,
    });
  } catch (error: any) {
    console.error("GET /api/jobs/live-updates error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}