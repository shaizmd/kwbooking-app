"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function savePayoutDetails(formData: FormData) {
  const user = await requireRole("HOST");
  const locale = formData.get("locale") as string;

  const legalName        = (formData.get("legalName") as string)?.trim();
  const taxId            = (formData.get("taxId") as string)?.trim() || undefined;
  const businessType     = (formData.get("businessType") as string) || "individual";
  const bankName         = (formData.get("bankName") as string)?.trim() || undefined;
  const accountHolderName= (formData.get("accountHolderName") as string)?.trim() || undefined;
  const accountNumber    = (formData.get("accountNumber") as string)?.trim() || undefined;
  const routingCode      = (formData.get("routingCode") as string)?.trim() || undefined;

  if (!legalName) {
    redirect(`/${locale}/host/account/payout?error=legal-name-required`);
  }

  await prisma.hostPayout.upsert({
    where: { hostId: user.sub },
    create: {
      hostId: user.sub,
      legalName,
      taxId,
      businessType,
      bankName,
      accountHolderName,
      // Only save unmasked values
      ...(accountNumber && !accountNumber.includes("•")
        ? { accountNumber }
        : {}),
      routingCode,
    },
    update: {
      legalName,
      taxId,
      businessType,
      bankName,
      accountHolderName,
      ...(accountNumber && !accountNumber.includes("•")
        ? { accountNumber }
        : {}),
      routingCode,
    },
  });

  revalidatePath(`/${locale}/host/account/payout`);
  redirect(`/${locale}/host/account/payout?success=saved`);
}
