"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { calculateBookingPrice } from "@/lib/booking/calculate-price";
import { redirect } from "next/navigation";

export async function createBooking({
  propertyId,
  checkIn,
  checkOut,
  guests,
  locale,
}: {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  locale: string;
}) {
  const user = await requireRole("CUSTOMER");

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (start >= end) {
    throw new Error("Invalid date range");
  }

  const nights = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const booking = await prisma.$transaction(async (tx) => {
    // 1. Load property
    const property = await tx.property.findFirst({
      where: {
        id: propertyId,
        status: "ACTIVE",
      },
    });

    if (!property) {
      throw new Error("Property not available");
    }

    // 2. Pax validation
    if (guests > property.maxGuests) {
      throw new Error("Guest limit exceeded");
    }

    // 3. Availability check
    const overlap = await tx.booking.findFirst({
      where: {
        propertyId,
        status: "CONFIRMED",
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
    });

    if (overlap) {
      throw new Error("Dates not available");
    }

    // 4. Price calculation
    const pricing = calculateBookingPrice({
      basePrice: Number(property.basePrice),
      nights,
      guests,
      baseGuests: property.baseGuests,
      extraGuestPrice: Number(property.extraGuestPrice || 0),
    });

    // 5. Create booking (PENDING)
    return tx.booking.create({
      data: {
        propertyId,
        customerId: user.sub,
        checkIn: start,
        checkOut: end,
        guests,
        subtotal: pricing.subtotal,
        extraCharges: pricing.extraCharges,
        totalAmount: pricing.total,
        currency: property.currency,
        status: "PENDING",
      },
    });
  });

  redirect(`/${locale}/bookings/${booking.id}/pay`);
}

export async function getBookingForPayment(bookingId: string) {
  const user = await requireRole("CUSTOMER");

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId: user.sub,
      status: "PENDING",
    },
    include: {
      property: {
        select: {
          title: true,
          location: true,
          pricePerNight: true,
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found or already processed");
  }

  return booking;
}
