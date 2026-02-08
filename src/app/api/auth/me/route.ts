import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const payload = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { 
        id: true, 
        email: true, 
        role: true,
        fullName: true,
        phone: true,
        isKycApproved: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
