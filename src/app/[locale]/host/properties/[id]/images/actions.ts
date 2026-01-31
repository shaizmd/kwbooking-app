"use server";

import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "booking-app-images";

/**
 * Generate presigned URL for image upload
 */
export async function getPropertyImageUploadUrl(propertyId: string) {
  const user = await requireRole("HOST");

  // Verify property ownership
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { hostId: true },
  });

  if (!property || property.hostId !== user.sub) {
    throw new Error("Unauthorized");
  }

  const fileKey = `properties/${propertyId}/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

  return { uploadUrl, fileUrl };
}

/**
 * Save image URL to database after upload
 */
export async function savePropertyImage(propertyId: string, imageUrl: string) {
  const user = await requireRole("HOST");

  // Verify property ownership
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { hostId: true, images: true },
  });

  if (!property || property.hostId !== user.sub) {
    throw new Error("Unauthorized");
  }

  // Get the next order index
  const maxOrder = property.images.length > 0
    ? Math.max(...property.images.map((img) => img.order))
    : -1;

  await prisma.propertyImage.create({
    data: {
      propertyId,
      imageUrl,
      order: maxOrder + 1,
    },
  });
}

/**
 * Delete property image
 */
export async function deletePropertyImage(imageId: string) {
  const user = await requireRole("HOST");

  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
    include: { property: { select: { hostId: true } } },
  });

  if (!image || image.property.hostId !== user.sub) {
    throw new Error("Unauthorized");
  }

  await prisma.propertyImage.delete({
    where: { id: imageId },
  });
}
