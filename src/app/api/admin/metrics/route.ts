export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      totalJobs,
      activeJobs,
      closedJobs,
      discoveredToday,
      discoveredThisHour,
      sources,
      recentCrawlRuns,
      canonicalCount,
      allActiveScores,
    ] = await Promise.all([
      db.job.count(),
      db.job.count({ where: { status: "ACTIVE" } }),
      db.job.count({ where: { status: { not: "ACTIVE" } } }),
      db.job.count({ where: { discoveredAt: { gte: startOfToday } } }),
      db.job.count({ where: { discoveredAt: { gte: oneHourAgo } } }),
      db.jobSource.findMany({
        include: {
          _count: { select: { jobs: true } },
        },
      }),
      db.crawlRun.findMany({
        take: 10,
        orderBy: { startedAt: "desc" },
        include: { source: true },
      }),
      db.canonicalJob.count({ where: { totalSources: { gt: 1 } } }),
      db.job.findMany({
        where: { status: "ACTIVE" },
        select: { postedAt: true },
        take: 100,
      }),
    ]);

    // Compute average freshness score
    let avgFreshness = 85;
    if (allActiveScores.length > 0) {
      const sum = allActiveScores.reduce((acc, curr) => {
        const diffMin = Math.max(0, (now.getTime() - curr.postedAt.getTime()) / (60 * 1000));
        let score = 30;
        if (diffMin < 1) score = 99;
        else if (diffMin < 5) score = 96;
        else if (diffMin < 30) score = 85;
        else if (diffMin < 180) score = 65;
        else if (diffMin < 1440) score = 50;
        return acc + score;
      }, 0);
      avgFreshness = Math.round(sum / allActiveScores.length);
    }

    return NextResponse.json({
      metrics: {
        totalJobs,
        activeJobs,
        closedJobs,
        discoveredToday,
        discoveredThisHour,
        duplicateJobsDetected: canonicalCount,
        averageFreshness: avgFreshness,
        activeSources: sources.filter((s) => s.isEnabled).length,
        totalSources: sources.length,
      },
      sources: sources.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        status: s.status,
        isEnabled: s.isEnabled,
        lastSyncAt: s.lastSyncAt ? s.lastSyncAt.toISOString() : null,
        errorCount: s.errorCount,
        lastErrorMessage: s.lastErrorMessage,
        totalJobs: s._count.jobs,
      })),
      recentCrawlRuns: recentCrawlRuns.map((r) => ({
        id: r.id,
        sourceName: r.source.name,
        startedAt: r.startedAt.toISOString(),
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
        status: r.status,
        discovered: r.jobsDiscovered,
        updated: r.jobsUpdated,
        closed: r.jobsClosed,
        errorMessage: r.errorMessage,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/admin/metrics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}