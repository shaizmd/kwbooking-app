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
      isActive: true,
      endsAt: { gt: new Date() },
    },
  });

  if (!activeSubscription) {
    throw new Error("Active subscription required to publish");
  }

  // 3. Image check
  const imageCount = await prisma.propertyImage.count({
    where: { propertyId },
  });

  if (imageCount === 0) {
    throw new Error("At least one image is required to publish");
  }

  // 4. Publish
  return prisma.property.update({
    where: { id: propertyId },
    data: { status: "ACTIVE" },
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
