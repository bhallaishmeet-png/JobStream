export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateFreshness } from "@/lib/freshness";
import { evaluateJobMatch } from "@/lib/ai/matcher";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await db.job.findUnique({
      where: { id: params.id },
      include: {
        canonicalJob: {
          include: {
            sources: true,
          },
        },
        sourceRecords: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const defaultUser = await db.user.findFirst({
      include: { profile: true },
    });

    const userProfile = defaultUser?.profile
      ? {
          skills: JSON.parse(defaultUser.profile.skills || "[]"),
          preferredLocations: JSON.parse(defaultUser.profile.preferredLocations || "[]"),
          preferredWorkModes: JSON.parse(defaultUser.profile.preferredWorkModes || "[]"),
          experienceLevel: defaultUser.profile.experienceLevel as any,
        }
      : undefined;

    const parsedSkills: string[] = JSON.parse(job.skills || "[]");
    const parsedResp: string[] = JSON.parse(job.responsibilities || "[]");
    const parsedReq: string[] = JSON.parse(job.requirements || "[]");
    const parsedBen: string[] = JSON.parse(job.benefits || "[]");

    const freshness = calculateFreshness(job.postedAt);

    const match = userProfile
      ? evaluateJobMatch(
          {
            title: job.title,
            location: job.location,
            workMode: job.workMode as any,
            experienceLevel: job.experienceLevel as any,
            skills: parsedSkills,
          },
          userProfile
        )
      : { score: 80, matchedSkills: parsedSkills.slice(0, 2), missingSkills: [], reasons: ["Role matches modern stack"] };

    const sourcesList = (job.canonicalJob?.sources || []).map((s) => ({
      sourceName: s.sourceName,
      originalUrl: s.originalUrl,
      firstSeenAt: s.firstSeenAt.toISOString(),
    }));

    if (sourcesList.length === 0) {
      sourcesList.push({
        sourceName: job.sourceName,
        originalUrl: job.canonicalUrl,
        firstSeenAt: job.discoveredAt.toISOString(),
      });
    }

    return NextResponse.json({
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
      responsibilities: parsedResp,
      requirements: parsedReq,
      benefits: parsedBen,
      skills: parsedSkills,
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
      matchScore: match.score,
      matchReasons: match.reasons,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      totalSources: job.canonicalJob?.totalSources || 1,
      sourcesList,
    });
  } catch (error: any) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}