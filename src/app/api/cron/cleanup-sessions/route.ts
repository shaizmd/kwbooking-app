import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredSessionsJob } from "@/lib/cron/jobs";

export async function GET(request: NextRequest) {
  // Security: Verify Vercel Cron secret
  const authHeader = request.headers.get("authorization");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await cleanupExpiredSessionsJob();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("[API] Session cleanup cron failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
