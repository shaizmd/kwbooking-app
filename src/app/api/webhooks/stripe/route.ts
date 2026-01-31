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
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    Logger.webhook("Webhook signature verification failed", {}, err as Error);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata.bookingId;

    if (!bookingId) {
      return NextResponse.json({ received: true });
    }

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          property: {
            select: {
              title: true,
            },
          },
          customer: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!booking || booking.status !== "PENDING") {
        return;
      }

      // 1. Mark booking confirmed
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });

      // 2. Store payment record
      await tx.payment.create({
        data: {
          bookingId,
          provider: "stripe",
          providerRef: intent.id,
          amount: intent.amount / 100,
          currency: intent.currency.toUpperCase(),
          status: "SUCCESS",
        },
      });

      // 3. Generate invoice number
      const invoiceNumber = generateInvoiceNumber(bookingId);

      // 4. Generate and store invoice PDF
      let pdfUrl: string;
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
          taxAmount: 0, // No tax for now
          totalAmount: Number(booking.totalAmount),
          currency: booking.currency,
        });
      } catch (error) {
        Logger.payment(
          "Invoice PDF generation failed (payment succeeded)",
          { bookingId: booking.id, paymentId: intent.id },
          error as Error
        );
        // Don't fail the transaction - payment succeeded
        // Admin can regenerate invoice manually if needed
        pdfUrl = "";
      }

      // 5. Create invoice record (only if PDF was generated)
      if (pdfUrl) {
        await tx.invoice.create({
          data: {
            bookingId: booking.id,
            invoiceNumber,
            subtotal: booking.subtotal,
            taxAmount: 0,
            totalAmount: booking.totalAmount,
            currency: booking.currency,
            pdfUrl,
          },
        });
        
        Logger.info("PAYMENT", "Payment and invoice processed successfully", {
          bookingId: booking.id,
          paymentId: intent.id,
          invoiceNumber,
        });
      }
    });
  }

  return NextResponse.json({ received: true });
}
