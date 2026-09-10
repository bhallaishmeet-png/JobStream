export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateFreshness } from "@/lib/freshness";
import { evaluateJobMatch } from "@/lib/ai/matcher";
import { ensureSourcesInitialized, syncAllSources } from "@/lib/sources/registry";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Auto-initialize if empty
    const jobCount = await db.job.count();
    if (jobCount === 0) {
      await ensureSourcesInitialized();
      await syncAllSources();
    }

    const searchQuery = searchParams.get("q") || searchParams.get("searchQuery") || "";
    const locations = searchParams.get("locations") ? searchParams.get("locations")!.split(",") : [];
    const experienceLevels = searchParams.get("experienceLevels") ? searchParams.get("experienceLevels")!.split(",") : [];
    const workModes = searchParams.get("workModes") ? searchParams.get("workModes")!.split(",") : [];
    const jobTypes = searchParams.get("jobTypes") ? searchParams.get("jobTypes")!.split(",") : [];
    const minSalary = searchParams.get("minSalary") ? parseInt(searchParams.get("minSalary")!) : undefined;
    const maxSalary = searchParams.get("maxSalary") ? parseInt(searchParams.get("maxSalary")!) : undefined;
    const postedWithin = searchParams.get("postedWithin") || "";
    const skills = searchParams.get("skills") ? searchParams.get("skills")!.split(",") : [];
    const company = searchParams.get("company") || "";
    const source = searchParams.get("source") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));

    // Build Prisma query filter
    const where: any = {
      status: "ACTIVE", // Only active jobs in feed
    };

    if (company) {
      where.companyName = { contains: company };
    }

    if (source) {
      where.sourceName = { contains: source };
    }

    if (workModes.length > 0) {
      where.workMode = { in: workModes };
    }

    if (jobTypes.length > 0) {
      where.jobType = { in: jobTypes };
    }

    if (experienceLevels.length > 0) {
      where.experienceLevel = { in: experienceLevels };
    }

    if (minSalary) {
      where.OR = [
        { minSalary: { gte: minSalary } },
        { maxSalary: { gte: minSalary } },
      ];
    }

    if (maxSalary) {
      where.minSalary = { lte: maxSalary };
    }

    // Posted time window
    if (postedWithin) {
      const now = new Date();
      let windowMs = 0;
      if (postedWithin === "5m") windowMs = 5 * 60 * 1000;
      else if (postedWithin === "15m") windowMs = 15 * 60 * 1000;
      else if (postedWithin === "30m") windowMs = 30 * 60 * 1000;
      else if (postedWithin === "1h") windowMs = 60 * 60 * 1000;
      else if (postedWithin === "3h") windowMs = 3 * 60 * 60 * 1000;
      else if (postedWithin === "24h") windowMs = 24 * 60 * 60 * 1000;
      else if (postedWithin === "7d") windowMs = 7 * 24 * 60 * 60 * 1000;

      if (windowMs > 0) {
        where.postedAt = { gte: new Date(now.getTime() - windowMs) };
      }
    }

    // Location multi-filter
    if (locations.length > 0) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: locations.map((loc) => ({
          location: { contains: loc },
        })),
      });
    }

    // Search query multi-field search (title, company, description, skills)
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { title: { contains: q } },
          { companyName: { contains: q } },
          { location: { contains: q } },
          { description: { contains: q } },
          { skills: { contains: q } },
        ],
      });
    }

    // Skills filter
    if (skills.length > 0) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: skills.map((sk) => ({
          skills: { contains: sk },
        })),
      });
    }

    // Get user profile for match calculation
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

    // Sorting definition
    let orderBy: any = [{ postedAt: "desc" }];
    if (sortBy === "highest_salary") {
      orderBy = [{ maxSalary: "desc" }, { minSalary: "desc" }];
    } else if (sortBy === "lowest_exp") {
      orderBy = [{ experienceLevel: "asc" }, { postedAt: "desc" }];
    }

    const [total, jobsRaw, totalActiveCount, discoveredLastHour, activeSourcesCount] = await Promise.all([
      db.job.count({ where }),
      db.job.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          canonicalJob: {
            include: { sources: true },
          },
        },
      }),
      db.job.count({ where: { status: "ACTIVE" } }),
      db.job.count({
        where: {
          discoveredAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      }),
      db.jobSource.count({ where: { isEnabled: true } }),
    ]);

    // Format output with freshness score and AI match evaluation
    const jobs = jobsRaw.map((job) => {
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
        : { score: 80, matchedSkills: parsedSkills.slice(0, 2), missingSkills: [], reasons: ["Role aligns with modern stack"] };

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
        sourcesList: job.canonicalJob?.sources.map((s) => ({
          sourceName: s.sourceName,
          originalUrl: s.originalUrl,
          firstSeenAt: s.firstSeenAt.toISOString(),
        })) || [
          {
            sourceName: job.sourceName,
            originalUrl: job.canonicalUrl,
            firstSeenAt: job.discoveredAt.toISOString(),
          },
        ],
      };
    });

    // If best match sort requested, sort in-memory
    if (sortBy === "best_match") {
      jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalActiveCount,
        discoveredLastHour,
        activeSourcesCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
