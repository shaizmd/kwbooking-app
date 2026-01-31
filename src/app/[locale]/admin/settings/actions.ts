"use server";

import { requireRole } from "@/lib/auth/require-role";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updatePlatformSettings(formData: FormData) {
  await requireRole("ADMIN");

  const bookingsEnabled = formData.get("bookingsEnabled") === "on";
  const paymentsEnabled = formData.get("paymentsEnabled") === "on";
  const newPropertiesEnabled = formData.get("newPropertiesEnabled") === "on";

  await db.platformSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      bookingsEnabled,
      paymentsEnabled,
      newPropertiesEnabled,
    },
    update: {
      bookingsEnabled,
      paymentsEnabled,
      newPropertiesEnabled,
    },
  });

  revalidatePath("/admin/settings");
  
  return { success: true };
}
