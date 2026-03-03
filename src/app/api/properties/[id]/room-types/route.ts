import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth/api";
import { z } from "zod";

const roomTypeSchema = z.object({
  name: z.string().min(2, "Room name must be at least 2 characters"),
  description: z.string().optional(),
  bedType: z.string().min(2, "Bed type is required"),
  bedCount: z.number().int().positive("Bed count must be at least 1"),
  maxGuests: z.number().int().positive("Max guests must be at least 1"),
  roomSize: z.number().int().positive().optional(),
  basePrice: z.number().positive("Price must be greater than 0"),
  features: z.array(z.string()).optional(),
  packages: z.array(z.object({
    name: z.string().min(2),
    originalPrice: z.number().optional(),
    finalPrice: z.number().positive(),
    discountPercent: z.number().int().min(0).max(100).optional(),
    isLimitedTime: z.boolean().default(false),
    dealLabel: z.string().optional(),
    freeCancellation: z.boolean().default(false),
    cancellationDeadline: z.number().int().optional(),
    cancellationDeadlineText: z.string().optional(),
    isRefundable: z.boolean().default(true),
    prepaymentRequired: z.boolean().default(false),
    noCreditCard: z.boolean().default(false),
    benefits: z.array(z.string()).optional(),
  })).min(1, "At least one package is required"),
});

// GET - List all room types for a property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        roomTypes: {
          where: { isActive: true },
          include: {
            packages: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ roomTypes: property.roomTypes });
  } catch (error) {
    console.error("Error fetching room types:", error);
    return NextResponse.json(
      { error: "Failed to fetch room types" },
      { status: 500 }
    );
  }
}

// POST - Create a new room type with packages
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth();
    
    if (!user || user.role !== "HOST") {
      return NextResponse.json(
        { error: "Unauthorized. Only hosts can manage room types." },
        { status: 403 }
      );
    }

    const { id: propertyId } = await params;

    // Verify the property belongs to the host
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.hostId !== user.sub) {
      return NextResponse.json(
        { error: "You can only manage room types for your own properties" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = roomTypeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid room type data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { packages, features, ...roomTypeData } = parsed.data;

    // Create room type with packages in a transaction
    const roomType = await prisma.roomType.create({
      data: {
        ...roomTypeData,
        propertyId,
        features: features ? JSON.stringify(features) : null,
        packages: {
          create: packages.map((pkg, index) => ({
            ...pkg,
            benefits: pkg.benefits ? JSON.stringify(pkg.benefits) : null,
            sortOrder: index,
          })),
        },
      },
      include: {
        packages: true,
      },
    });

    return NextResponse.json(roomType, { status: 201 });
  } catch (error) {
    console.error("Error creating room type:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create room type" },
      { status: 500 }
    );
  }
}
