"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import crypto from "crypto";
import { r2 } from "@/lib/storage/r2";

export async function getPropertyImageUploadUrl(propertyId: string) {
  const user = await requireRole("HOST");

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.hostId !== user.sub) {
    throw new Error("Unauthorized");
  }

  const imageId = crypto.randomUUID();
  const key = `properties/${propertyId}/${imageId}.jpg`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: "image/jpeg",
  });

  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: 60, // seconds
  });

  return {
    uploadUrl,
    fileUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
}

export async function savePropertyImage(
  propertyId: string,
  imageUrl: string
) {
  const user = await requireRole("HOST");

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.hostId !== user.sub) {
    throw new Error("Unauthorized");
  }

  const count = await prisma.propertyImage.count({
    where: { propertyId },
  });

  return prisma.propertyImage.create({
    data: {
      propertyId,
      imageUrl,
      order: count,
    },
  });
}
