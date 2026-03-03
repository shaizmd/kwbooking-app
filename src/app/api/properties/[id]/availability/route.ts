import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/properties/[id]/availability
 *
 * Returns all unavailable date ranges for a property:
 * - CONFIRMED bookings (hard blocks)
 * - Manually blocked dates (maintenance, host personal use, etc.)
 *
 * Used by the frontend date picker to disable unavailable dates.
 * PENDING bookings are NOT included — they haven't paid yet and will
 * auto-cancel if unpaid. Only confirmed bookings block dates.
 *
 * Query params:
 *   from  (optional) — only return ranges that end after this date (ISO)
 *   to    (optional) — only return ranges that start before this date (ISO)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;

    // Verify property exists and is active
    const property = await prisma.property.findFirst({
      where: { id: propertyId, status: "ACTIVE" },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch confirmed bookings (future only)
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        propertyId,
        status: "CONFIRMED",
        checkOut: { gt: today },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
      orderBy: { checkIn: "asc" },
    });

    // Fetch manually blocked dates (future only)
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        propertyId,
        endDate: { gt: today },
      },
      select: {
        startDate: true,
        endDate: true,
        reason: true,
      },
      orderBy: { startDate: "asc" },
    });

    // Format date ranges as YYYY-MM-DD strings
    const bookedRanges = confirmedBookings.map((b) => ({
      from: b.checkIn.toISOString().split("T")[0],
      to: b.checkOut.toISOString().split("T")[0],
    }));

    const manuallyBlockedRanges = blockedDates.map((b) => ({
      from: b.startDate.toISOString().split("T")[0],
      to: b.endDate.toISOString().split("T")[0],
      reason: b.reason,
    }));

    return NextResponse.json(
      {
        bookedRanges,
        manuallyBlockedRanges,
        // Merged list for convenience (all unavailable).
        // This is what the date-picker disabledDates prop should consume.
        unavailableRanges: [
          ...bookedRanges,
          ...manuallyBlockedRanges.map(({ from, to }) => ({ from, to })),
        ],
      },
      {
        headers: {
          // Cache for 30 seconds — short enough to reflect recent confirmations
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=10",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
