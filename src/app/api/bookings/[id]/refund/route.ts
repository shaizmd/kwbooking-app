import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth/api";
import { stripe, refundConnectedPayment } from "@/lib/payments/stripe";
import { Logger } from "@/lib/logger";
import { z } from "zod";

const refundSchema = z.object({
  reason: z.enum(["requested_by_customer", "duplicate", "fraudulent"]).default("requested_by_customer"),
  note: z.string().max(500).optional(),
});

/**
 * POST /api/bookings/[id]/refund
 *
 * Initiates a refund for a confirmed booking.
 * Accessible by: HOST (for their property) or ADMIN.
 *
 * If the host has a Stripe Connect account the refund is issued from that account.
 * Otherwise the refund is issued from the platform account (fallback).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;

  const user = await verifyAuth();
  if (!user || (user.role !== "HOST" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = refundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true,
      property: {
        select: { hostId: true },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // HOST can only refund their own property's bookings
  if (user.role === "HOST" && booking.property.hostId !== user.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Only confirmed bookings can be refunded." },
      { status: 400 }
    );
  }

  if (!booking.payment) {
    return NextResponse.json(
      { error: "No payment record found for this booking." },
      { status: 400 }
    );
  }

  if (booking.payment.status === "REFUNDED") {
    return NextResponse.json({ error: "Already refunded." }, { status: 400 });
  }

  try {
    let refundId: string;

    if (booking.payment.stripeConnectId) {
      // Payment was through a connected account — refund via that account
      const refund = await refundConnectedPayment({
        paymentIntentId: booking.payment.providerRef,
        connectedAccountId: booking.payment.stripeConnectId,
        reason: parsed.data.reason,
      });
      refundId = refund.id;
    } else {
      // Legacy / platform-level payment — refund from platform account
      const refund = await stripe.refunds.create({
        payment_intent: booking.payment.providerRef,
        reason: parsed.data.reason,
      });
      refundId = refund.id;
    }

    // Update booking + payment in a transaction
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "REFUNDED",
          cancellationReason: parsed.data.note ?? `Refunded by ${user.role.toLowerCase()}`,
          refundAmount: booking.totalAmount,
        },
      }),
      prisma.payment.update({
        where: { bookingId },
        data: {
          status: "REFUNDED",
          refundId,
          refundReason: parsed.data.reason,
          refundedAt: new Date(),
        },
      }),
    ]);

    Logger.info("PAYMENT", "Refund issued successfully", {
      bookingId,
      refundId,
      issuedBy: user.sub,
      role: user.role,
    });

    return NextResponse.json({ success: true, refundId });
  } catch (error) {
    Logger.payment(
      "Refund failed",
      { bookingId, issuedBy: user.sub },
      error as Error
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Refund failed" },
      { status: 500 }
    );
  }
}
