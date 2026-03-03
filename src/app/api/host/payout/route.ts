import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth/api";
import { z } from "zod";

const payoutSchema = z.object({
  legalName: z.string().min(2, "Legal name is required"),
  taxId: z.string().optional(),
  businessType: z.enum(["individual", "company"]).default("individual"),
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingCode: z.string().optional(),
  platformFeePercent: z.number().min(0).max(100).optional(),
});

// GET  /api/host/payout — fetch current payout details
export async function GET() {
  const user = await verifyAuth();
  if (!user || user.role !== "HOST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payout = await prisma.hostPayout.findUnique({
    where: { hostId: user.sub },
    select: {
      id: true,
      legalName: true,
      taxId: true,
      businessType: true,
      bankName: true,
      accountHolderName: true,
      // Mask all but last 4 digits of account number
      accountNumber: true,
      routingCode: true,
      stripeConnectId: true,
      onboardingStatus: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      platformFeePercent: true,
      updatedAt: true,
    },
  });

  // Mask account number before returning
  if (payout?.accountNumber) {
    payout.accountNumber =
      "•".repeat(Math.max(0, payout.accountNumber.length - 4)) +
      payout.accountNumber.slice(-4);
  }

  return NextResponse.json({ payout });
}

// POST /api/host/payout — create / update payout details
export async function POST(request: NextRequest) {
  const user = await verifyAuth();
  if (!user || user.role !== "HOST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = payoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const payout = await prisma.hostPayout.upsert({
    where: { hostId: user.sub },
    create: {
      hostId: user.sub,
      legalName: data.legalName,
      taxId: data.taxId,
      businessType: data.businessType,
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      accountNumber: data.accountNumber,
      routingCode: data.routingCode,
      platformFeePercent: data.platformFeePercent,
      onboardingStatus: "PENDING",
    },
    update: {
      legalName: data.legalName,
      taxId: data.taxId,
      businessType: data.businessType,
      bankName: data.bankName,
      accountHolderName: data.accountHolderName,
      // Only update account number if a real (unmasked) value was sent
      ...(data.accountNumber && !data.accountNumber.includes("•")
        ? { accountNumber: data.accountNumber }
        : {}),
      routingCode: data.routingCode,
      platformFeePercent: data.platformFeePercent,
    },
    select: {
      id: true,
      legalName: true,
      taxId: true,
      businessType: true,
      bankName: true,
      accountHolderName: true,
      routingCode: true,
      stripeConnectId: true,
      onboardingStatus: true,
      chargesEnabled: true,
      payoutsEnabled: true,
    },
  });

  return NextResponse.json({ payout });
}
