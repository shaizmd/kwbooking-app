"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function updateHostProfile(formData: FormData) {
  const user = await requireRole("HOST");
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

  revalidatePath(`/${locale}/host/account`);
  redirect(`/${locale}/host/account?success=profile`);
}

export async function changeHostPassword(formData: FormData) {
  const user = await requireRole("HOST");
  const locale = formData.get("locale") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    redirect(`/${locale}/host/account?error=password-mismatch`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.sub },
  });

  if (!dbUser) {
    redirect(`/${locale}/host/account?error=user-not-found`);
  }

  const isValidPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!isValidPassword) {
    redirect(`/${locale}/host/account?error=incorrect-password`);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.sub },
    data: {
      passwordHash: hashedPassword,
    },
  });

  revalidatePath(`/${locale}/host/account`);
  redirect(`/${locale}/host/account?success=password`);
}

