"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { stripe } from "@/lib/payments/stripe";

export async function createPaymentIntent(bookingId: string) {
  const user = await requireRole("CUSTOMER");

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId: user.sub,
      status: "PENDING",
    },
  });

  if (!booking) {
    throw new Error("Invalid booking");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(booking.totalAmount) * 100), // smallest unit
    currency: booking.currency.toLowerCase(),
    metadata: {
      bookingId: booking.id,
      customerId: user.sub,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
}
