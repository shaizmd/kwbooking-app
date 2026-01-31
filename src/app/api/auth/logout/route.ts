import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/auth/session";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      await prisma.session.deleteMany({
        where: {
          refreshTokenHash: hashToken(refreshToken),
        },
      });
    }

    await clearAuthCookies();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: true }); // Still clear cookies even on error
  }
}
