"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { stripe } from "@/lib/payments/stripe";
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
      return { success: false, error: "Booking is not pending payment" };
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(booking.totalAmount) * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      metadata: {
        bookingId: booking.id,
        userId: user.sub,
        propertyTitle: booking.property.title,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return { success: false, error: "Failed to create payment intent" };
  }
  });
}
