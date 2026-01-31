import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/auth/validators";
import { checkRateLimit, RateLimits, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  // Rate limiting
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(`register:${clientIp}`, RateLimits.AUTH);
  
  if (rateCheck.limited) {
    return rateLimitResponse(rateCheck.resetIn);
  }
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, phone, fullName, role } = parsed.data;

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.email === email ? "Email already exists" : "Phone already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        phone,
        fullName,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
      },
    });

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
