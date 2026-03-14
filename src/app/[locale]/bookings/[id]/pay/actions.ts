"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import {
  stripe,
  createConnectedPaymentIntent,
  calculateApplicationFee,
} from "@/lib/payments/stripe";
import { withRateLimit, RateLimits } from "@/lib/security/action-rate-limit";

export async function createPaymentIntent(bookingId: string) {
  return withRateLimit("payment-intent", RateLimits.PAYMENT_INTENT, async () => {
  try {
    const user = await requireRole("CUSTOMER");

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          select: {
            title: true,
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.customerId !== user.sub) {
      return { success: false, error: "Unauthorized" };
    }

    if (booking.status !== "PENDING") {
      console.log("Booking is not pending. Status:", booking.status);
      return { success: false, error: "Booking is not pending payment" };
    }

    // List of 3-decimal currencies for Stripe
    const threeDecimalCurrencies = ["KWD", "BHD", "OMR", "JOD", "TND"];
    const isThreeDecimal = threeDecimalCurrencies.includes(booking.currency.toUpperCase());
    const multiplier = isThreeDecimal ? 1000 : 100;
    const amountSmallestUnit = Math.round(Number(booking.totalAmount) * multiplier);

    if (!Number.isFinite(amountSmallestUnit) || amountSmallestUnit <= 0) {
      return { success: false, error: "Invalid payment amount" };
    }

    console.log(`Stripe attempt: Amount: ${Number(booking.totalAmount)}, Multiplier: ${multiplier}, Currency: ${booking.currency.toLowerCase()}`);

    // Look up the host's Stripe Connect account for this property
    const hostPayout = await prisma.hostPayout.findUnique({
      where: { hostId: booking.property.hostId },
      select: {
        stripeConnectId: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        platformFeePercent: true,
      },
    });

    const useConnect =
      hostPayout?.stripeConnectId &&
      hostPayout.chargesEnabled &&
      hostPayout.payoutsEnabled;

    let paymentIntent;

    if (useConnect) {
      // Route payment through host's connected account
      // Platform takes an application fee (default 10% if not overridden)
      const feePercent = Number(hostPayout!.platformFeePercent ?? 10);
      const applicationFeeAmount = calculateApplicationFee(amountSmallestUnit, feePercent);

      paymentIntent = await createConnectedPaymentIntent({
        amount: amountSmallestUnit,
        currency: booking.currency.toLowerCase(),
        connectedAccountId: hostPayout!.stripeConnectId!,
        applicationFeeAmount,
        metadata: {
          bookingId: booking.id,
          userId: user.sub,
          propertyTitle: booking.property.title,
          hostAccountId: hostPayout!.stripeConnectId!,
        },
      });

      console.log(
        `Stripe Connect PaymentIntent created: ${paymentIntent.id}`,
        `(fee: ${feePercent}% = ${applicationFeeAmount} ${booking.currency})`
      );
    } else {
      // Fallback: platform-level charge (host hasn't completed Connect onboarding)
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountSmallestUnit,
        currency: booking.currency.toLowerCase(),
        metadata: {
          bookingId: booking.id,
          userId: user.sub,
          propertyTitle: booking.property.title,
        },
        automatic_payment_methods: { enabled: true },
      });

      console.log("Stripe PaymentIntent created (platform):", paymentIntent.id);
    }

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error: unknown) {
    console.error("Payment intent creation error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create payment intent" 
    };
  }
  });
}
