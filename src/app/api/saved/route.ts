export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateFreshness } from "@/lib/freshness";

export async function GET() {
  try {
    const user = await db.user.findFirst();
    if (!user) {
      return NextResponse.json({ savedJobs: [] });
    }

    const savedRecords = await db.savedJob.findMany({
      where: { userId: user.id },
      include: {
        job: {
          include: {
            canonicalJob: {
              include: { sources: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = savedRecords.map((record) => {
      const job = record.job;
      const freshness = calculateFreshness(job.postedAt);

      return {
        id: record.id,
        status: record.status,
        notes: record.notes,
        savedAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        job: {
          id: job.id,
          title: job.title,
          companyName: job.companyName,
          companyLogo: `https://avatar.vercel.sh/${encodeURIComponent(job.companyName)}.svg?text=${encodeURIComponent(job.companyName.slice(0, 2).toUpperCase())}`,
          location: job.location,
          workMode: job.workMode,
          experienceLevel: job.experienceLevel,
          jobType: job.jobType,
          minSalary: job.minSalary,
          maxSalary: job.maxSalary,
          salaryCurrency: job.salaryCurrency,
          salaryPeriod: job.salaryPeriod,
          status: job.status,
          sourceName: job.sourceName,
          applyUrl: job.applyUrl,
          postedAt: job.postedAt.toISOString(),
          freshnessScore: freshness.score,
          skills: JSON.parse(job.skills || "[]"),
        },
      };
    });

    return NextResponse.json({ savedJobs: formatted });
  } catch (error: any) {
    console.error("GET /api/saved error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await db.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { jobId, status = "SAVED", notes } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // Toggle if already saved and requested status is same or 'toggle'
    const existing = await db.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
    });

    if (body.action === "toggle" && existing) {
      await db.savedJob.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isSaved: false, action: "removed" });
    }

    if (existing) {
      const updated = await db.savedJob.update({
        where: { id: existing.id },
        data: {
          status,
          notes: notes !== undefined ? notes : existing.notes,
        },
      });
      return NextResponse.json({ isSaved: true, savedRecord: updated });
    }

    const created = await db.savedJob.create({
      data: {
        userId: user.id,
        jobId,
        status,
        notes,
      },
    });

    return NextResponse.json({ isSaved: true, savedRecord: created });
  } catch (error: any) {
    console.error("POST /api/saved error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.savedJob.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/saved error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}