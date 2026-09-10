export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSourcesInitialized } from "@/lib/sources/registry";

export async function GET() {
  try {
    await ensureSourcesInitialized();

    const sources = await db.jobSource.findMany({
      include: {
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const result = await Promise.all(
      sources.map(async (s) => {
        const todayCount = await db.job.count({
          where: {
            sourceId: s.id,
            discoveredAt: { gte: startOfDay },
          },
        });

        return {
          id: s.id,
          name: s.name,
          type: s.type,
          endpoint: s.endpoint,
          isEnabled: s.isEnabled,
          status: s.status,
          lastSyncAt: s.lastSyncAt ? s.lastSyncAt.toISOString() : null,
          errorCount: s.errorCount,
          lastErrorMessage: s.lastErrorMessage,
          jobCount: s._count.jobs,
          jobsDiscoveredToday: todayCount,
        };
      })
    );

    return NextResponse.json({ sources: result });
  } catch (error: any) {
    console.error("GET /api/sources error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isEnabled } = body;

    if (!id) {
      return NextResponse.json({ error: "Source ID is required" }, { status: 400 });
    }

    const updated = await db.jobSource.update({
      where: { id },
      data: {
        isEnabled: typeof isEnabled === "boolean" ? isEnabled : undefined,
      },
    });

    return NextResponse.json({ success: true, source: updated });
  } catch (error: any) {
    console.error("PATCH /api/sources error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}