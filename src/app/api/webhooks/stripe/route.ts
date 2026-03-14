import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { generateInvoicePDF, generateInvoiceNumber } from "@/lib/invoice/generate";
import { Logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    Logger.webhook("Missing Stripe signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  // Try platform webhook secret first, then Connect secret
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
      );
    } catch (err) {
      const error = err as Error;
      Logger.webhook("Webhook signature verification failed", {}, error);
      return NextResponse.json(
        { error: `Webhook verification failed: ${error.message}` },
        { status: 400 }
      );
    }
  }

  // ── Idempotency guard ───────────────────────────────────────────────────────
  // Log every event; if we've already processed it, return 200 immediately.
  const existingLog = await prisma.webhookLog.findUnique({
    where: { eventId: event.id },
    select: { status: true },
  });

  if (existingLog?.status === "PROCESSED") {
    console.log(`[WEBHOOK] Already processed event ${event.id}, skipping.`);
    return NextResponse.json({ received: true });
  }

  // Create or update log entry as RECEIVED
  await prisma.webhookLog.upsert({
    where: { eventId: event.id },
    create: {
      provider: "stripe",
      eventId: event.id,
      eventType: event.type,
      payload: body,
      status: "RECEIVED",
    },
    update: { status: "RECEIVED" },
  });
  // ────────────────────────────────────────────────────────────────────────────

  try {
    if (event.type === "payment_intent.succeeded") {
      await handlePaymentSucceeded(event);
    } else if (event.type === "account.updated") {
      await handleAccountUpdated(event);
    } else {
      console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    // Mark as processed
    await prisma.webhookLog.update({
      where: { eventId: event.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
  } catch (err) {
    const error = err as Error;
    Logger.webhook(`Webhook processing failed for ${event.type}`, { eventId: event.id }, error);

    await prisma.webhookLog.update({
      where: { eventId: event.id },
      data: { status: "FAILED", error: error.message },
    });

    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Handler: payment_intent.succeeded ────────────────────────────────────────

async function handlePaymentSucceeded(event: Stripe.Event) {
  const intent = event.data.object as Stripe.PaymentIntent;
  const bookingId = intent.metadata?.bookingId;

  const threeDecimalCurrencies = ["KWD", "BHD", "OMR", "JOD", "TND"];
  const isThreeDecimal = threeDecimalCurrencies.includes(intent.currency.toUpperCase());
  const divisor = isThreeDecimal ? 1000 : 100;

  console.log("=== WEBHOOK: payment_intent.succeeded ===");
  console.log("Payment Intent ID:", intent.id);
  console.log("Booking ID from metadata:", bookingId);

  if (!bookingId) {
    console.log("No bookingId in metadata, skipping processing");
    return;
  }

  // Determine if this came via a connected account
  const connectedAccountId =
    (event as Stripe.Event & { account?: string }).account ?? null;

  let isDoubleBooking = false;

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: { select: { title: true } },
        customer: { select: { email: true } },
      },
    });

    if (!booking || booking.status !== "PENDING") {
      console.log("Booking not found or not PENDING, skipping");
      return;
    }

    // ── Availability re-check (race condition guard) ──────────────────────────
    const conflictingBooking = await tx.booking.findFirst({
      where: {
        id: { not: bookingId },
        propertyId: booking.propertyId,
        status: "CONFIRMED",
        checkIn: { lt: booking.checkOut },
        checkOut: { gt: booking.checkIn },
      },
      select: { id: true },
    });

    if (conflictingBooking) {
      console.log("⚠ Double booking detected — issuing refund for", bookingId);

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancellationReason:
            "Property was already booked for these dates. A full refund has been issued.",
        },
      });

      await tx.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          provider: "stripe",
          providerRef: intent.id,
          amount: intent.amount / divisor,
          currency: intent.currency.toUpperCase(),
          status: "REFUNDED",
          stripeConnectId: connectedAccountId,
        },
        update: {
          providerRef: intent.id,
          amount: intent.amount / divisor,
          currency: intent.currency.toUpperCase(),
          status: "REFUNDED",
          stripeConnectId: connectedAccountId,
        },
      });

      isDoubleBooking = true;
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Calculate platform fee from the intent (set as application_fee_amount)
    const applicationFee = intent.application_fee_amount ?? 0;
    const totalAmount = intent.amount / divisor;
    const platformFee  = applicationFee / divisor;
    const hostAmount  = totalAmount - platformFee;

    // 1. Confirm booking
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    // 2. Store payment with split details
    await tx.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        provider: "stripe",
        providerRef: intent.id,
        amount: totalAmount,
        currency: intent.currency.toUpperCase(),
        status: "SUCCESS",
        stripeConnectId: connectedAccountId,
        platformFee: platformFee,
        hostAmount: hostAmount,
      },
      update: {
        providerRef: intent.id,
        amount: totalAmount,
        currency: intent.currency.toUpperCase(),
        status: "SUCCESS",
        stripeConnectId: connectedAccountId,
        platformFee: platformFee,
        hostAmount: hostAmount,
      },
    });

    // 3. Generate invoice
    const invoiceNumber = generateInvoiceNumber(bookingId);
    const isR2Configured =
      process.env.R2_ENDPOINT &&
      !process.env.R2_ENDPOINT.includes("<account-id>") &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_ACCESS_KEY_ID !== "xxxxxxxx";

    let pdfUrl = "";
    if (isR2Configured) {
      try {
        pdfUrl = await generateInvoicePDF({
          invoiceNumber,
          bookingId: booking.id,
          propertyTitle: booking.property.title,
          customerEmail: booking.customer.email,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          subtotal: Number(booking.subtotal),
          extraCharges: Number(booking.extraCharges),
          taxAmount: 0,
          totalAmount: Number(booking.totalAmount),
          currency: booking.currency,
        });
      } catch (invoiceErr) {
        Logger.payment(
          "Invoice PDF generation failed (payment succeeded)",
          { bookingId: booking.id },
          invoiceErr as Error
        );
      }
    }

    if (pdfUrl) {
      await tx.invoice.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          invoiceNumber,
          subtotal: booking.subtotal,
          taxAmount: 0,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          pdfUrl,
        },
        update: {
          subtotal: booking.subtotal,
          taxAmount: 0,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          pdfUrl,
        },
      });
    }

    Logger.info("PAYMENT", "Payment confirmed", {
      bookingId: booking.id,
      paymentId: intent.id,
      platformFee: platformFee.toString(),
      hostAmount: hostAmount.toString(),
    });
  });

  // Issue refund outside the transaction if double-booking
  if (isDoubleBooking) {
    try {
      if (connectedAccountId) {
        await stripe.refunds.create(
          { payment_intent: intent.id, reason: "duplicate" },
          { stripeAccount: connectedAccountId }
        );
      } else {
        await stripe.refunds.create({ payment_intent: intent.id, reason: "duplicate" });
      }
      console.log("✓ Refund issued for double-booking:", bookingId);
    } catch (refundError) {
      Logger.payment(
        "Failed to issue automatic refund for double-booking",
        { bookingId, paymentIntentId: intent.id },
        refundError as Error
      );
    }
  }
}

// ── Handler: account.updated (Stripe Connect) ────────────────────────────────

async function handleAccountUpdated(event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;

  const payout = await prisma.hostPayout.findUnique({
    where: { stripeConnectId: account.id },
  });

  if (!payout) {
    console.log(`[WEBHOOK] account.updated for unknown Connect ID: ${account.id}`);
    return;
  }

  await prisma.hostPayout.update({
    where: { stripeConnectId: account.id },
    data: {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      onboardingStatus: account.details_submitted
        ? account.charges_enabled
          ? "COMPLETE"
          : "RESTRICTED"
        : "IN_PROGRESS",
    },
  });

  Logger.info("PAYMENT", "Connected account status updated", {
    stripeConnectId: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  });
}
