import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth/api";
import { z } from "zod";

const propertySchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
  location: z.string().min(2, { message: "Location must be at least 2 characters long" }),
  propertyType: z.string(),
  basePrice: z.number().positive(),
  baseGuests: z.number().int().positive(),
  maxGuests: z.number().int().positive(),
  extraGuestPrice: z.number().nonnegative().optional(),
  bedrooms: z.number().int().positive(),
  bathrooms: z.number().int().positive(),
  beds: z.number().int().positive(),
  areaSize: z.number().int().positive().optional(),
  floor: z.number().int().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth();
    
    if (!user || user.role !== "HOST") {
      return NextResponse.json(
        { error: "Unauthorized. Only hosts can create properties." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid property data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Cross-field validation: ensure maxGuests is not less than baseGuests
    if (parsed.data.maxGuests < parsed.data.baseGuests) {
      return NextResponse.json(
        {
          error: "Invalid property data",
          details: [
            {
              path: ["maxGuests"],
              message: "Max guests cannot be less than base guests",
            },
          ],
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        hostId: user.sub,
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
        propertyType: parsed.data.propertyType,
        basePrice: parsed.data.basePrice,
        baseGuests: parsed.data.baseGuests,
        maxGuests: parsed.data.maxGuests,
        extraGuestPrice: parsed.data.extraGuestPrice,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        beds: parsed.data.beds,
        areaSize: parsed.data.areaSize,
        floor: parsed.data.floor,
        checkInTime: parsed.data.checkInTime || "14:00",
        checkOutTime: parsed.data.checkOutTime || "11:00",
        status: "DRAFT",
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
