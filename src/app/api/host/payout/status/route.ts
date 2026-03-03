import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth/api";
import { retrieveConnectedAccount } from "@/lib/payments/stripe";

/**
 * POST /api/host/payout/status
 *
 * Syncs the Stripe connected account status back to our DB.
 * Called after returning from Stripe onboarding (stripe=return query param).
 */
export async function POST() {
  const user = await verifyAuth();
  if (!user || user.role !== "HOST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payout = await prisma.hostPayout.findUnique({
    where: { hostId: user.sub },
    select: { stripeConnectId: true },
  });

  if (!payout?.stripeConnectId) {
    return NextResponse.json(
      { error: "No Stripe account linked yet." },
      { status: 400 }
    );
  }

  const account = await retrieveConnectedAccount(payout.stripeConnectId);

  const updated = await prisma.hostPayout.update({
    where: { hostId: user.sub },
    data: {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      onboardingStatus: account.details_submitted
        ? account.charges_enabled
          ? "COMPLETE"
          : "RESTRICTED"
        : "IN_PROGRESS",
    },
    select: {
      onboardingStatus: true,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
    },
  });

  return NextResponse.json({ status: updated });
}
