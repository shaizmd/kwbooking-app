import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("STRIPE_SECRET_KEY is required in production");
  }
  console.warn("WARNING: STRIPE_SECRET_KEY is not set in environment variables!");
}

export const stripe = new Stripe(
  stripeSecretKey || "sk_test_placeholder",
  {
    apiVersion: "2024-06-20",
  }
);

// ─── Stripe Connect Helpers ───────────────────────────────────────────────────

/**
 * Create a Stripe Express connected account for a host.
 * Express gives a hosted onboarding UI owned by Stripe (best UX).
 */
export async function createConnectedAccount(params: {
  email: string;
  businessType: "individual" | "company";
  country?: string; // ISO-3166 alpha-2, default "KW"
}): Promise<Stripe.Account> {
  return stripe.accounts.create({
    type: "express",
    email: params.email,
    country: params.country ?? "KW",
    business_type: params.businessType,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    settings: {
      payouts: {
        schedule: { interval: "weekly", weekly_anchor: "monday" },
      },
    },
  });
}

/**
 * Generate a Stripe Connect onboarding link.
 * After the host completes the form they are redirected to `returnUrl`.
 */
export async function createAccountLink(params: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<Stripe.AccountLink> {
  return stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: "account_onboarding",
  });
}

/**
 * Retrieve the latest state of a connected account from Stripe.
 */
export async function retrieveConnectedAccount(
  accountId: string
): Promise<Stripe.Account> {
  return stripe.accounts.retrieve(accountId);
}

/**
 * Calculate the platform application fee given the total in smallest unit.
 * platformFeePercent is 0–100 (e.g. 10 = 10%).
 */
export function calculateApplicationFee(
  totalAmountSmallestUnit: number,
  platformFeePercent: number
): number {
  return Math.round(totalAmountSmallestUnit * (platformFeePercent / 100));
}

/**
 * Create a PaymentIntent routed through a connected account.
 * `applicationFeeAmount` stays with the platform; the rest settles to the host.
 */
export async function createConnectedPaymentIntent(params: {
  amount: number;
  currency: string;
  connectedAccountId: string;
  applicationFeeAmount: number;
  metadata: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create(
    {
      amount: params.amount,
      currency: params.currency,
      application_fee_amount: params.applicationFeeAmount,
      metadata: params.metadata,
      automatic_payment_methods: { enabled: true },
    },
    { stripeAccount: params.connectedAccountId }
  );
}

/**
 * Issue a full or partial refund on a connected account.
 */
export async function refundConnectedPayment(params: {
  paymentIntentId: string;
  connectedAccountId: string;
  amountSmallestUnit?: number;
  reason?: Stripe.RefundCreateParams.Reason;
}): Promise<Stripe.Refund> {
  return stripe.refunds.create(
    {
      payment_intent: params.paymentIntentId,
      ...(params.amountSmallestUnit !== undefined && {
        amount: params.amountSmallestUnit,
      }),
      reason: params.reason ?? "requested_by_customer",
    },
    { stripeAccount: params.connectedAccountId }
  );
}
