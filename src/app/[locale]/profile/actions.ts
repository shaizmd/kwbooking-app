"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const user = await requireRole("CUSTOMER");
  const locale = formData.get("locale") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  await prisma.user.update({
    where: { id: user.sub },
    data: {
      fullName: fullName || null,
      phone: phone || null,
    },
  });

  revalidatePath(`/${locale}/profile`);
  redirect(`/${locale}/profile?success=profile`);
}

export async function changePassword(formData: FormData) {
  const user = await requireRole("CUSTOMER");
  const locale = formData.get("locale") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    redirect(`/${locale}/profile?error=password-mismatch`);
  }

  // Get user with password
  const dbUser = await prisma.user.findUnique({
    where: { id: user.sub },
  });

  if (!dbUser) {
    redirect(`/${locale}/profile?error=user-not-found`);
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!isValidPassword) {
    redirect(`/${locale}/profile?error=incorrect-password`);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: user.sub },
    data: {
      passwordHash: hashedPassword,
    },
  });

  revalidatePath(`/${locale}/profile`);
  redirect(`/${locale}/profile?success=password`);
}
