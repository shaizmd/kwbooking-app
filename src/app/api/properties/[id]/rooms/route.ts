import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

// GET /api/properties/[id]/rooms - Get all room types for a property
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const roomTypes = await prisma.roomType.findMany({
      where: {
        propertyId: id,
        isActive: true,
      },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Parse JSON fields
    const formattedRoomTypes = roomTypes.map((rt) => ({
      ...rt,
      features: rt.features ? JSON.parse(rt.features) : [],
      packages: rt.packages.map((pkg) => ({
        ...pkg,
        benefits: pkg.benefits ? JSON.parse(pkg.benefits) : [],
        originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : null,
        finalPrice: Number(pkg.finalPrice),
      })),
    }));

    return NextResponse.json({ roomTypes: formattedRoomTypes });
  } catch (error) {
    console.error("Error fetching room types:", error);
    return NextResponse.json(
      { error: "Failed to fetch room types" },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/rooms - Create a room type (HOST only)
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(token.value);
    if (!payload || payload.role !== "HOST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        id,
        hostId: payload.sub,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      nameAr,
      description,
      bedType,
      bedCount,
      roomSize,
      maxGuests,
      basePrice,
      features,
    } = body;

    const roomType = await prisma.roomType.create({
      data: {
        propertyId: id,
        name,
        nameAr,
        description,
        bedType,
        bedCount: bedCount || 1,
        roomSize,
        maxGuests: maxGuests || 2,
        basePrice,
        features: JSON.stringify(features || []),
      },
    });

    return NextResponse.json({ roomType }, { status: 201 });
  } catch (error) {
    console.error("Error creating room type:", error);
    return NextResponse.json(
      { error: "Failed to create room type" },
      { status: 500 }
    );
  }
}
