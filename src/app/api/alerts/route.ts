export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await db.user.findFirst();
    if (!user) {
      return NextResponse.json({ alerts: [] });
    }

    const alerts = await db.jobAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const formatted = alerts.map((a) => ({
      id: a.id,
      name: a.name,
      query: a.query,
      filters: JSON.parse(a.filters || "{}"),
      frequency: a.frequency,
      emailNotification: a.emailNotification,
      browserNotification: a.browserNotification,
      isEnabled: a.isEnabled,
      lastTriggeredAt: a.lastTriggeredAt ? a.lastTriggeredAt.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({ alerts: formatted });
  } catch (error: any) {
    console.error("GET /api/alerts error:", error);
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
    const { name, query, filters = {}, frequency = "REALTIME", emailNotification = true, browserNotification = true } = body;

    if (!name) {
      return NextResponse.json({ error: "Alert name is required" }, { status: 400 });
    }

    const alert = await db.jobAlert.create({
      data: {
        userId: user.id,
        name,
        query: query || null,
        filters: JSON.stringify(filters),
        frequency,
        emailNotification,
        browserNotification,
        isEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      alert: {
        id: alert.id,
        name: alert.name,
        query: alert.query,
        filters,
        frequency: alert.frequency,
        emailNotification: alert.emailNotification,
        browserNotification: alert.browserNotification,
        isEnabled: alert.isEnabled,
        createdAt: alert.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("POST /api/alerts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isEnabled } = body;

    if (!id) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const updated = await db.jobAlert.update({
      where: { id },
      data: {
        isEnabled: typeof isEnabled === "boolean" ? isEnabled : undefined,
      },
    });

    return NextResponse.json({ success: true, alert: updated });
  } catch (error: any) {
    console.error("PATCH /api/alerts error:", error);
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

    await db.jobAlert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/alerts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}