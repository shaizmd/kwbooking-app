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
    const error = err as Error;
    console.error("WEBHOOK ERROR:", error.message);
    Logger.webhook("Webhook signature verification failed", {}, error);
    return NextResponse.json(
      { error: `Webhook verification failed: ${error.message}` },
      { status: 400 }
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata.bookingId;

    console.log("=== WEBHOOK: payment_intent.succeeded ===");
    console.log("Payment Intent ID:", intent.id);
    console.log("Booking ID from metadata:", bookingId);

    if (!bookingId) {
      console.log("No bookingId in metadata, skipping processing");
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

      console.log("Booking found:", !!booking);
      if (booking) {
        console.log("Booking status:", booking.status);
      }

      if (!booking || booking.status !== "PENDING") {
        console.log("Booking not found or not PENDING, skipping");
        return;
      }

      console.log("Processing booking confirmation...");

      // 1. Mark booking confirmed
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
      console.log("✓ Booking marked as CONFIRMED");

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
      console.log("✓ Payment record created");

      // 3. Generate invoice number
      const invoiceNumber = generateInvoiceNumber(bookingId);
      console.log("Invoice number:", invoiceNumber);

      // 4. Generate and store invoice PDF
      let pdfUrl: string;
      try {
        console.log("Generating invoice PDF...");
        
        // Check if R2 is configured
        const isR2Configured = process.env.R2_ENDPOINT && 
                               !process.env.R2_ENDPOINT.includes('<account-id>') &&
                               process.env.R2_ACCESS_KEY_ID &&
                               process.env.R2_ACCESS_KEY_ID !== 'xxxxxxxx';
        
        if (isR2Configured) {
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
          console.log("✓ Invoice PDF generated:", pdfUrl);
        } else {
          console.log("⚠ R2 not configured, using placeholder URL");
          pdfUrl = `placeholder://invoices/${invoiceNumber}.pdf`;
        }
      } catch (error) {
        console.error("✗ Invoice PDF generation failed:", error);
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
        console.log("✓ Invoice record created");
        
        Logger.info("PAYMENT", "Payment and invoice processed successfully", {
          bookingId: booking.id,
          paymentId: intent.id,
          invoiceNumber,
        });
      } else {
        console.log("⚠ Skipping invoice creation (PDF generation failed)");
      }
      
      console.log("=== WEBHOOK PROCESSING COMPLETE ===");
    });
  }

  return NextResponse.json({ received: true });
}
