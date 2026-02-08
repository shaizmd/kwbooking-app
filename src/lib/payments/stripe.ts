import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("WARNING: STRIPE_SECRET_KEY is not set in environment variables!");
}

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    // @ts-expect-error - Using latest API version
    apiVersion: "2024-06-20",
  }
);
