import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    // Redirect back to settings page — use Referer to preserve locale,
    // fall back to the default locale path.
    const referer = request.headers.get("referer");
    const redirectUrl = referer
      ? new URL(referer)
      : new URL("/en/admin/settings", request.url);
    return NextResponse.redirect(redirectUrl);
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
