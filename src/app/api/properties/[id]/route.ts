import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth/api";
import { z } from "zod";

const propertyUpdateSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  location: z.string().min(2).optional(),
  basePrice: z.number().positive().optional(),
  baseGuests: z.number().int().positive().optional(),
  maxGuests: z.number().int().positive().optional(),
  extraGuestPrice: z.number().nonnegative().optional(),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "ACTIVE", "INACTIVE", "BLOCKED", "REJECTED"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyAuth(request);
    
    if (!user || user.role !== "HOST") {
      return NextResponse.json(
        { error: "Unauthorized. Only hosts can update properties." },
        { status: 403 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.hostId !== user.sub) {
      return NextResponse.json(
        { error: "Unauthorized. You can only update your own properties." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = propertyUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid property data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updatedProperty);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
