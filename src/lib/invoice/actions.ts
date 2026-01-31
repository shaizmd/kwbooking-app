"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";

/**
 * Fetches invoice for a booking.
 * Only accessible by the customer who made the booking or admin.
 */
export async function getInvoiceForBooking(bookingId: string) {
  const user = await requireRole("CUSTOMER");

  const invoice = await prisma.invoice.findUnique({
    where: { bookingId },
    include: {
      booking: {
        select: {
          id: true,
          customerId: true,
          checkIn: true,
          checkOut: true,
          guests: true,
          status: true,
          property: {
            select: {
              title: true,
              location: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  // Check authorization - only booking customer can access
  if (invoice.booking.customerId !== user.sub) {
    throw new Error("Unauthorized");
  }

  return invoice;
}

/**
 * Lists all invoices for the current customer
 */
export async function getCustomerInvoices() {
  const user = await requireRole("CUSTOMER");

  const invoices = await prisma.invoice.findMany({
    where: {
      booking: {
        customerId: user.sub,
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
          status: true,
          property: {
            select: {
              title: true,
              location: true,
            },
          },
        },
      },
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  return invoices;
}
