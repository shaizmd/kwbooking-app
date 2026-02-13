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
  console.log("=== BOOKING CREATION STARTED ===");
  console.log("Property ID:", propertyId);
  console.log("Dates:", checkIn, "to", checkOut);
  console.log("Guests:", guests);
  console.log("Room selections:", { roomTypeIds, packageIds, quantities });
  
  // Auth check
  let user;
  try {
    user = await requireRole("CUSTOMER");
    console.log("User authenticated:", user.sub, "Role:", user.role);
  } catch (error) {
    console.error("Auth error:", error);
    if (error instanceof Error) {
      if (error.message === "Unauthorized" || error.message === "Invalid token") {
        redirect(`/${locale}/login?redirect=/${locale}/properties/${propertyId}/book`);
      }
      if (error.message === "Forbidden: Insufficient permissions") {
        redirect(`/${locale}/properties/${propertyId}`);
      }
    }
    throw error;
  }

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

  // Create booking in transaction
  let booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
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
      let totalRoomCount = 0;
      let selectedRoomTypeId: string | null = null;
      let selectedPackageId: string | null = null;
      
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
            totalRoomCount += quantity;
            // Save first room type and package for the booking record
            if (!selectedRoomTypeId) {
              selectedRoomTypeId = roomTypeId;
              selectedPackageId = pkg.id;
            }
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
          // Use total (base + extra guests) as the pre-tax subtotal
          subtotal = pricing.total;
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
        // Use total (base + extra guests) as the pre-tax subtotal
        subtotal = pricing.total;
      }

      const taxRate = 0.05; // 5% tax
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      // 5. Create booking (PENDING) with guest details
      return tx.booking.create({
        data: {
          propertyId,
          customerId: user.sub,
          roomTypeId: selectedRoomTypeId,
          packageId: selectedPackageId,
          checkIn: start,
          checkOut: end,
          guests,
          roomCount: totalRoomCount || 1,
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
  } catch (error) {
    console.log("=== BOOKING TRANSACTION ERROR ===");
    console.error("Transaction error:", error);
    
    // Handle known errors
    if (error instanceof Error) {
      if (
        error.message === "Property not available" ||
        error.message === "Guest limit exceeded" ||
        error.message === "Dates not available"
      ) {
        redirect(`/${locale}/properties/${propertyId}?error=${encodeURIComponent(error.message)}`);
      }
    }
    // Redirect with generic error
    redirect(`/${locale}/properties/${propertyId}?error=booking_failed`);
  }

  console.log("=== BOOKING CREATED SUCCESSFULLY ===");
  console.log("Booking ID:", booking.id);
  console.log("Redirecting to:", `/${locale}/bookings/${booking.id}/pay`);
  
  // Redirect to payment page - this MUST NOT be in a try-catch
  redirect(`/${locale}/bookings/${booking.id}/pay`);
}

export async function getBookingForPayment(bookingId: string) {
  console.log("=== GET BOOKING FOR PAYMENT ===");
  console.log("Booking ID:", bookingId);
  
  try {
    const user = await requireRole("CUSTOMER");
    console.log("User authenticated:", user.sub);

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
      console.log("Booking not found or already processed");
      throw new Error("Booking not found or already processed");
    }

    console.log("Booking found successfully");
    return booking;
  } catch (error) {
    console.error("Error in getBookingForPayment:", error);
    throw error;
  }
}
