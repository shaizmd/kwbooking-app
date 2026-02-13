"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function updateAdminProfile(formData: FormData) {
  const user = await requireRole("ADMIN");
  const locale = formData.get("locale") as string;
  const fullName = formData.get("fullName") as string;

  await prisma.user.update({
    where: { id: user.sub },
    data: {
      fullName: fullName || null,
    },
  });

  revalidatePath(`/${locale}/admin/account`);
  redirect(`/${locale}/admin/account?success=profile`);
}

export async function changeAdminPassword(formData: FormData) {
  const user = await requireRole("ADMIN");
  const locale = formData.get("locale") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    redirect(`/${locale}/admin/account?error=password-mismatch`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.sub },
  });

  if (!dbUser) {
    redirect(`/${locale}/admin/account?error=user-not-found`);
  }

  const isValidPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!isValidPassword) {
    redirect(`/${locale}/admin/account?error=incorrect-password`);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.sub },
    data: {
      passwordHash: hashedPassword,
    },
  });

  revalidatePath(`/${locale}/admin/account`);
  redirect(`/${locale}/admin/account?success=password`);
}

