import { NextRequest, NextResponse } from "next/server";
import { runAllMaintenanceJobs } from "@/lib/cron/jobs";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const accessToken = request.cookies.get("access_token")?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(accessToken);
    
    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Run all maintenance jobs
    const results = await runAllMaintenanceJobs();

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("[API] Manual job execution failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
