"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { z } from "zod";

const propertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  location: z.string().min(3),
  basePrice: z.number().positive(),
  currency: z.string().length(3),
  baseGuests: z.number().int().positive(),
  maxGuests: z.number().int().positive(),
  extraGuestPrice: z.number().nonnegative().optional(),
});

export async function createProperty(data: unknown) {
  const user = await requireRole("HOST");

  const parsed = propertySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid property data");
  }

  const {
    title,
    description,
    location,
    basePrice,
    currency,
    baseGuests,
    maxGuests,
    extraGuestPrice,
  } = parsed.data;

  if (maxGuests < baseGuests) {
    throw new Error("Max guests cannot be less than base guests");
  }

  return prisma.property.create({
    data: {
      hostId: user.sub,
      title,
      description,
      location,
      basePrice,
      currency,
      baseGuests,
      maxGuests,
      extraGuestPrice,
      status: "DRAFT",
    },
  });
}

export async function updateProperty(
  propertyId: string,
  data: unknown
) {
  const user = await requireRole("HOST");

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.hostId !== user.sub) {
    throw new Error("Unauthorized");
  }

  const parsed = propertySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid property data");
  }

  if (parsed.data.maxGuests < parsed.data.baseGuests) {
    throw new Error("Max guests cannot be less than base guests");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: parsed.data,
  });
}
