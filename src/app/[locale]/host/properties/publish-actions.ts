"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";

export async function publishProperty(propertyId: string) {
  const user = await requireRole("HOST");

  // 1. Property ownership
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.hostId !== user.sub) {
    throw new Error("Unauthorized");
  }

  if (property.status === "BLOCKED") {
    throw new Error("Property is blocked by admin");
  }

  // 2. Active subscription check
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      hostId: user.sub,
      status: "ACTIVE",
      endsAt: { gt: new Date() },
    },
  });

  // In production, enforce active subscription.
  // In development, allow publishing without a subscription to simplify testing.
  if (!activeSubscription && process.env.NODE_ENV === "production") {
    throw new Error("Active subscription required to publish");
  }

  // 3. Image check
  const imageCount = await prisma.propertyImage.count({
    where: { propertyId },
  });

  // In production, enforce at least one image.
  // In development, allow publishing without images for easier testing.
  if (imageCount === 0 && process.env.NODE_ENV === "production") {
    throw new Error("At least one image is required to publish");
  }

  // 4. Submit for admin approval
  // Properties go through PENDING_APPROVAL → ACTIVE so admins can review
  // before a listing goes live. The admin panel approves/rejects.
  return prisma.property.update({
    where: { id: propertyId },
    data: { status: "PENDING_APPROVAL" },
  });
}

export async function unpublishProperty(propertyId: string) {
  const user = await requireRole("HOST");

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.hostId !== user.sub) {
    throw new Error("Unauthorized");
  }

  if (property.status !== "ACTIVE") {
    throw new Error("Property is not active");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: { status: "INACTIVE" },
  });
}
