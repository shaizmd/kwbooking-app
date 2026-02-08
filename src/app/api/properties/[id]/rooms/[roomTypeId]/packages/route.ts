import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// POST /api/properties/[id]/rooms/[roomTypeId]/packages - Create a package
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; roomTypeId: string }> }
) {
  try {
    const { id, roomTypeId } = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token.value);
    if (!payload || payload.role !== "HOST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify property and room type ownership
    const roomType = await prisma.roomType.findFirst({
      where: {
        id: roomTypeId,
        propertyId: id,
        property: {
          hostId: payload.sub,
        },
      },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      nameAr,
      originalPrice,
      finalPrice,
      discountPercent,
      isLimitedTime,
      dealLabel,
      freeCancellation,
      cancellationDeadline,
      cancellationDeadlineText,
      isRefundable,
      prepaymentRequired,
      noCreditCard,
      benefits,
      sortOrder,
    } = body;

    const package_ = await prisma.roomPackage.create({
      data: {
        roomTypeId,
        name,
        nameAr,
        originalPrice,
        finalPrice,
        discountPercent,
        isLimitedTime: isLimitedTime || false,
        dealLabel,
        freeCancellation: freeCancellation || false,
        cancellationDeadline,
        cancellationDeadlineText,
        isRefundable: isRefundable !== undefined ? isRefundable : true,
        prepaymentRequired: prepaymentRequired || false,
        noCreditCard: noCreditCard || false,
        benefits: JSON.stringify(benefits || []),
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ package: package_ }, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}

// GET /api/properties/[id]/rooms/[roomTypeId]/packages - Get packages for a room type
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; roomTypeId: string }> }
) {
  try {
    const { roomTypeId } = await context.params;

    const packages = await prisma.roomPackage.findMany({
      where: {
        roomTypeId,
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    // Parse JSON fields
    const formattedPackages = packages.map((pkg) => ({
      ...pkg,
      benefits: pkg.benefits ? JSON.parse(pkg.benefits) : [],
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : null,
      finalPrice: Number(pkg.finalPrice),
    }));

    return NextResponse.json({ packages: formattedPackages });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
