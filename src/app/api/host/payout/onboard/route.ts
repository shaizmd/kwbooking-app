import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuth } from "@/lib/auth/api";
import {
  createConnectedAccount,
  createAccountLink,
  retrieveConnectedAccount,
} from "@/lib/payments/stripe";

/**
 * POST /api/host/payout/onboard
 *
 * Creates (or re-opens) a Stripe Express onboarding session for the host.
 * Returns { url } — redirect the browser to this URL.
 */
export async function POST(request: NextRequest) {
  const user = await verifyAuth();
  if (!user || user.role !== "HOST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load host payout record — must exist before calling this endpoint
  const payout = await prisma.hostPayout.findUnique({
    where: { hostId: user.sub },
  });

  if (!payout) {
    return NextResponse.json(
      { error: "Please save your legal/bank details first." },
      { status: 400 }
    );
  }

  // Load host email for Stripe account creation
  const host = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { email: true },
  });

  if (!host) {
    return NextResponse.json({ error: "Host not found" }, { status: 404 });
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Detect locale from Referer header or default to "en"
  const referer = request.headers.get("referer") ?? "";
  const localeMatch = referer.match(/\/([a-z]{2})\//);
  const locale = localeMatch?.[1] ?? "en";

  const returnUrl  = `${origin}/${locale}/host/account/payout?stripe=return`;
  const refreshUrl = `${origin}/${locale}/host/account/payout?stripe=refresh`;

  let connectId = payout.stripeConnectId;

  // Create a new connected account if one doesn't exist yet
  if (!connectId) {
    const account = await createConnectedAccount({
      email: host.email,
      businessType: payout.businessType as "individual" | "company",
    });

    connectId = account.id;

    await prisma.hostPayout.update({
      where: { hostId: user.sub },
      data: {
        stripeConnectId: connectId,
        onboardingStatus: "IN_PROGRESS",
      },
    });
  } else {
    // Sync latest status from Stripe before generating a new link
    const account = await retrieveConnectedAccount(connectId);
    await prisma.hostPayout.update({
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
    });

    if (account.details_submitted && account.charges_enabled) {
      return NextResponse.json({
        alreadyComplete: true,
        message: "Your Stripe account setup is already complete.",
      });
    }
  }

  const accountLink = await createAccountLink({
    accountId: connectId,
    returnUrl,
    refreshUrl,
  });

  return NextResponse.json({ url: accountLink.url });
}
