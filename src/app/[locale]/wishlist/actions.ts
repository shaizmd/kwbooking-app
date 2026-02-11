"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addToWishlist(formData: FormData) {
  let user;
  try {
    user = await requireRole("CUSTOMER");
  } catch (err) {
    const locale = formData.get("locale") as string | null;
    redirect(`/${locale || "en"}/login`);
  }
  const propertyId = formData.get("propertyId") as string;
  const locale = formData.get("locale") as string;

  if (!propertyId) {
    throw new Error("Property ID is required");
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findFirst({
    where: {
      userId: user.sub,
      propertyId,
    },
  });

  if (!existing) {
    await prisma.wishlist.create({
      data: {
        userId: user.sub,
        propertyId,
      },
    });
  }

  revalidatePath(`/${locale}/wishlist`);
  revalidatePath(`/${locale}/properties`);
  revalidatePath(`/${locale}/properties/${propertyId}`);
}

export async function removeFromWishlist(formData: FormData) {
  let user;
  try {
    user = await requireRole("CUSTOMER");
  } catch (err) {
    const locale = formData.get("locale") as string | null;
    redirect(`/${locale || "en"}/login`);
  }
  const propertyId = formData.get("propertyId") as string;
  const locale = formData.get("locale") as string;

  if (!propertyId) {
    throw new Error("Property ID is required");
  }

  await prisma.wishlist.deleteMany({
    where: {
      userId: user.sub,
      propertyId,
    },
  });

  revalidatePath(`/${locale}/wishlist`);
  revalidatePath(`/${locale}/properties`);
  revalidatePath(`/${locale}/properties/${propertyId}`);
}

export async function toggleWishlist(formData: FormData) {
  let user;
  try {
    user = await requireRole("CUSTOMER");
  } catch (err) {
    const locale = formData.get("locale") as string | null;
    redirect(`/${locale || "en"}/login`);
  }
  const propertyId = formData.get("propertyId") as string;
  const locale = formData.get("locale") as string;

  if (!propertyId) {
    throw new Error("Property ID is required");
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findFirst({
    where: {
      userId: user.sub,
      propertyId,
    },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.wishlist.create({
      data: {
        userId: user.sub,
        propertyId,
      },
    });
  }

  revalidatePath(`/${locale}/wishlist`);
  revalidatePath(`/${locale}/properties`);
  revalidatePath(`/${locale}/properties/${propertyId}`);
}
