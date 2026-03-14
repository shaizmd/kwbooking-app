# Payment Integration (Quick Guide)

## What this system does
- Uses Stripe for customer payments.
- Supports Stripe Connect for host payouts (with platform fee split).
- Confirms bookings via webhook (source of truth), not frontend redirect alone.
- Supports refunds and invoice generation.

## Payment flow (simple)
1. Customer creates booking (`PENDING`).
2. Server creates Stripe PaymentIntent.
3. Customer pays in Stripe Elements.
4. Stripe sends webhook `payment_intent.succeeded`.
5. Backend sets booking `CONFIRMED`, stores payment, generates invoice.

## Connect flow (hosts)
- If host has connected account with `chargesEnabled` + `payoutsEnabled`:
   - Payment is created on connected account.
   - Platform keeps `application_fee_amount`.
- Otherwise, payment falls back to platform account.

## Key files
- Checkout UI: `src/app/[locale]/bookings/[id]/pay/PaymentForm.tsx`
- Payment intent action: `src/app/[locale]/bookings/[id]/pay/actions.ts`
- Stripe helpers: `src/lib/payments/stripe.ts`
- Webhook handler: `src/app/api/webhooks/stripe/route.ts`
- Success verification: `src/app/[locale]/bookings/[id]/success/page.tsx`
- Refund API: `src/app/api/bookings/[id]/refund/route.ts`
- Host payout onboarding APIs:
   - `src/app/api/host/payout/route.ts`
   - `src/app/api/host/payout/onboard/route.ts`
   - `src/app/api/host/payout/status/route.ts`

## Required environment variables
```bash
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
```

## Security highlights
- Role/ownership checks before creating payment intents.
- Webhook signature verification.
- Idempotent webhook processing via `WebhookLog.eventId`.
- Amount + booking metadata verification on success page.
- Refunds restricted by role and payment/booking status.

## Supported APIs (summary)
- `POST /api/webhooks/stripe`
- `POST /api/bookings/[id]/refund`
- `GET /api/bookings/[id]/status`
- `GET/POST /api/host/payout`
- `POST /api/host/payout/onboard`
- `POST /api/host/payout/status`

## Local testing
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Test cards:
- Success: `4242 4242 4242 4242`
- 3DS: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

## Notes
- Booking confirmation is webhook-driven; success page may briefly show “processing”.
- For currencies like `KWD`, smallest-unit conversion uses 3 decimals.

