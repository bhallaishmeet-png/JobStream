import { NextRequest, NextResponse } from "next/server";
import { syncAllSources, simulateMarketEvent } from "@/lib/sources/registry";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "sync";

    if (action === "simulate") {
      const simResult = await simulateMarketEvent();
      return NextResponse.json({
        success: true,
        action: "simulate",
        result: simResult,
      });
    }

    const results = await syncAllSources();
    return NextResponse.json({
      success: true,
      action: "sync",
      results,
    });
  } catch (error: any) {
    console.error("POST /api/sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}