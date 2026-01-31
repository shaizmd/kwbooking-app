import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth/api";
import { z } from "zod";

const propertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  location: z.string().min(2),
  basePrice: z.number().positive(),
  baseGuests: z.number().int().positive(),
  maxGuests: z.number().int().positive(),
  extraGuestPrice: z.number().nonnegative().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
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

    const property = await prisma.property.create({
      data: {
        hostId: user.sub,
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
        basePrice: parsed.data.basePrice,
        baseGuests: parsed.data.baseGuests,
        maxGuests: parsed.data.maxGuests,
        extraGuestPrice: parsed.data.extraGuestPrice,
        status: "DRAFT",
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
