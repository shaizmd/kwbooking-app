import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const accessToken = request.cookies.get("accessToken")?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(accessToken);
    
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const bookingsEnabled = formData.get("bookingsEnabled") === "on";
    const paymentsEnabled = formData.get("paymentsEnabled") === "on";
    const newPropertiesEnabled = formData.get("newPropertiesEnabled") === "on";

    // Update settings
    await db.platformSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        bookingsEnabled,
        paymentsEnabled,
        newPropertiesEnabled,
        updatedBy: payload.sub,
      },
      update: {
        bookingsEnabled,
        paymentsEnabled,
        newPropertiesEnabled,
        updatedBy: payload.sub,
      },
    });

    // Redirect back to settings page
    return NextResponse.redirect(new URL("/admin/settings", request.url));
  } catch (error) {
    console.error("[API] Settings update failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
