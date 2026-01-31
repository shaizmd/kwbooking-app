import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/validators";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit, RateLimits, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  // Rate limiting
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`login:${clientIp}`, RateLimits.AUTH);
  
  if (rateCheck.limited) {
    return rateLimitResponse(rateCheck.resetIn);
  }
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const payload = { sub: user.id, role: user.role };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Extract IP and User-Agent for session tracking
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await createSession(
      user.id,
      refreshToken,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress,
      userAgent
    );

    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isKycApproved: user.isKycApproved,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
