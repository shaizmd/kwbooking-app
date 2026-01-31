import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    // @ts-expect-error - Using latest API version
    apiVersion: "2024-06-20",
  }
);
