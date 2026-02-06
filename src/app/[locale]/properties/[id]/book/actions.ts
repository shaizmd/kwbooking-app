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
  guestFullName,
  guestEmail,
  guestPhone,
  arrivalTime,
  specialRequests,
  roomTypeIds,
  packageIds,
  quantities,
  locale,
}: {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestFullName: string;
  guestEmail: string;
  guestPhone?: string;
  arrivalTime?: string;
  specialRequests?: string;
  roomTypeIds?: string[];
  packageIds?: string[];
  quantities?: number[];
  locale: string;
}) {
  try {
    const user = await requireRole("CUSTOMER");

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      redirect(`/${locale}/properties/${propertyId}`);
    }

    if (start >= end) {
      redirect(`/${locale}/properties/${propertyId}`);
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

    // 4. Calculate price from room selections or base price
    let subtotal = 0;
    
    if (roomTypeIds && roomTypeIds.length > 0 && packageIds && packageIds.length > 0) {
      // Load room types and packages to calculate accurate pricing
      const roomTypes = await tx.roomType.findMany({
        where: {
          id: { in: roomTypeIds },
          propertyId,
          isActive: true,
        },
        include: {
          packages: {
            where: {
              id: { in: packageIds },
              isActive: true,
            },
          },
        },
      });

      // Calculate total from selected packages
      roomTypeIds.forEach((roomTypeId, index) => {
        const roomType = roomTypes.find(rt => rt.id === roomTypeId);
        const pkg = roomType?.packages.find(p => p.id === packageIds[index]);
        const quantity = quantities?.[index] || 1;
        
        if (pkg) {
          subtotal += Number(pkg.finalPrice) * nights * quantity;
        }
      });

      // If no valid packages found, fall back to base price
      if (subtotal === 0) {
        const pricing = calculateBookingPrice({
          basePrice: Number(property.basePrice),
          nights,
          guests,
          baseGuests: property.baseGuests,
          extraGuestPrice: Number(property.extraGuestPrice || 0),
        });
        subtotal = pricing.subtotal;
      }
    } else {
      // No room selections - use base price
      const pricing = calculateBookingPrice({
        basePrice: Number(property.basePrice),
        nights,
        guests,
        baseGuests: property.baseGuests,
        extraGuestPrice: Number(property.extraGuestPrice || 0),
      });
      subtotal = pricing.subtotal;
    }

    const taxRate = 0.05; // 5% tax
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // 5. Create booking (PENDING) with guest details
    return tx.booking.create({
      data: {
        propertyId,
        customerId: user.sub,
        checkIn: start,
        checkOut: end,
        guests,
        guestFullName,
        guestEmail,
        guestPhone,
        arrivalTime,
        specialRequests,
        subtotal,
        extraCharges: taxAmount,
        totalAmount,
        currency: property.currency,
        status: "PENDING",
      },
    });
  });

  redirect(`/${locale}/bookings/${booking.id}/pay`);
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Error) {
      if (error.message === "Unauthorized" || error.message === "Invalid token") {
        redirect(`/${locale}/login?redirect=/${locale}/properties/${propertyId}/book`);
      }
      if (error.message === "Forbidden: Insufficient permissions") {
        redirect(`/${locale}/properties/${propertyId}`);
      }
    }
    // Re-throw other errors
    throw error;
  }
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
          basePrice: true,
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
