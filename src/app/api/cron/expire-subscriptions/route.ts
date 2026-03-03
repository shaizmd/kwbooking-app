/**
 * Vercel Cron API Routes
 * 
 * To enable in production, add cron configuration to vercel.json
 * 
 * Schedule examples:
 * - Daily at midnight KWT: "0 21 * * *" (UTC)
 * - Every 15 minutes: "0,15,30,45 * * * *"
 * 
 * See vercel.json in project root for full configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { expireSubscriptionsJob } from "@/lib/cron/jobs";

export async function GET(request: NextRequest) {
  // Security: Verify Vercel Cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await expireSubscriptionsJob();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error("[API] Subscription expiry cron failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
