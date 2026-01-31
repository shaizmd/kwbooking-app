# Payment Integration with Stripe

## Overview

The booking app now includes complete Stripe payment integration that handles secure payments for property bookings.

## Features

✅ **Secure Payment Processing** - Stripe Elements for PCI-compliant card handling  
✅ **Payment Intent Creation** - Server-side payment intent generation  
✅ **Webhook Handling** - Automatic booking confirmation on successful payment  
✅ **Payment Status Tracking** - Real-time payment status updates  
✅ **Success/Failure Pages** - User-friendly post-payment experience  

## Architecture

### Files Created/Modified

#### 1. Payment Pages
- **`src/app/[locale]/bookings/[id]/pay/page.tsx`** - Main payment page with booking summary
- **`src/app/[locale]/bookings/[id]/pay/PaymentForm.tsx`** - Client component with Stripe Elements
- **`src/app/[locale]/bookings/[id]/pay/actions.ts`** - Server actions for payment intent creation
- **`src/app/[locale]/bookings/[id]/success/page.tsx`** - Payment success confirmation page

#### 2. Core Payment Infrastructure
- **`src/lib/payments/stripe.ts`** - Stripe client initialization
- **`src/app/api/webhooks/stripe/route.ts`** - Webhook handler for payment events

#### 3. Updated Booking Flow
- **`src/app/[locale]/properties/[id]/book/actions.ts`** 
  - Updated redirect to payment page after booking creation
  - Added `getBookingForPayment()` helper function

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Stripe Keys (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (Get from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Install Stripe CLI (for local development)

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop install stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 3. Set Up Webhook Forwarding (Local Development)

```bash
# Login to Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output your webhook signing secret - add it to `.env` as `STRIPE_WEBHOOK_SECRET`.

### 4. Test Payment Flow

Use Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Any future expiry date and any 3-digit CVC.

## Payment Flow

### 1. User Journey

```
Browse Property → Book Property → Select Dates/Guests → 
Create Booking (PENDING) → Payment Page → 
Enter Card Details → Confirm Payment → 
Success Page (Booking status: CONFIRMED)
```

### 2. Technical Flow

```
1. User completes booking form
   └─> createBooking() creates PENDING booking
   └─> Redirects to /bookings/{id}/pay

2. Payment page loads
   └─> getBookingForPayment() fetches booking data
   └─> createPaymentIntent() creates Stripe PaymentIntent
   └─> Returns clientSecret to frontend

3. User enters card details
   └─> Stripe Elements handles card input
   └─> stripe.confirmPayment() processes payment
   └─> Redirects to /bookings/{id}/success

4. Stripe sends webhook
   └─> payment_intent.succeeded event
   └─> Updates booking status to CONFIRMED
   └─> Creates Payment record
```

## API Endpoints

### POST `/api/webhooks/stripe`

Handles Stripe webhook events.

**Supported Events:**
- `payment_intent.succeeded` - Confirms booking and creates payment record

**Security:**
- Validates webhook signature using `STRIPE_WEBHOOK_SECRET`
- Verifies booking exists and is in PENDING status
- Uses transaction to ensure data consistency

## Database Schema

### Booking Model
```prisma
model Booking {
  status       BookingStatus // PENDING, CONFIRMED, CANCELLED, COMPLETED
  totalAmount  Decimal
  currency     String
  payment      Payment?
  // ... other fields
}
```

### Payment Model
```prisma
model Payment {
  bookingId        String
  amount           Decimal
  currency         String
  provider         String    // "stripe"
  transactionId    String    // Stripe PaymentIntent ID
  status           PaymentStatus
  // ... other fields
}
```

## Security Features

✅ **Authentication Required** - Only authenticated CUSTOMER users can make payments  
✅ **Authorization Checks** - Users can only pay for their own bookings  
✅ **Webhook Verification** - All webhook requests are cryptographically verified  
✅ **HTTPS Only** - Stripe requires HTTPS in production  
✅ **No Card Storage** - Card details never touch your server (PCI compliance)  

## Production Checklist

Before going live:

- [ ] Replace test keys with live Stripe keys
- [ ] Set up production webhook endpoint in Stripe Dashboard
- [ ] Configure webhook signing secret for production
- [ ] Enable HTTPS for your domain
- [ ] Test payment flow with live cards
- [ ] Set up email notifications for payment confirmations
- [ ] Monitor Stripe Dashboard for payment issues
- [ ] Implement refund handling if needed
- [ ] Add payment receipt generation
- [ ] Set up proper error logging and monitoring

## Stripe Dashboard Configuration

1. **API Keys**
   - Navigate to Developers → API Keys
   - Copy Publishable and Secret keys

2. **Webhooks**
   - Navigate to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select event: `payment_intent.succeeded`
   - Copy webhook signing secret

3. **Payment Methods**
   - Navigate to Settings → Payment Methods
   - Enable desired payment methods (cards, wallets, etc.)

## Customization

### Currency Support

The payment system supports multiple currencies. Update in:

1. **Booking Creation** - Set `currency` field when creating booking
2. **Payment Intent** - Currency is automatically passed from booking
3. **Display** - `formatCurrency()` handles localization

### Styling

Stripe Elements appearance is customized in `PaymentForm.tsx`:

```typescript
appearance: {
  theme: "stripe",
  variables: {
    colorPrimary: "#d32f2f",  // Your brand color
    fontFamily: "Circular Book, Helvetica Neue, Helvetica, Arial, sans-serif",
    borderRadius: "8px",
  },
}
```

## Troubleshooting

### Payment Intent Creation Fails

- Check `STRIPE_SECRET_KEY` is set correctly
- Verify booking exists and is in PENDING status
- Check server logs for detailed error messages

### Webhook Not Receiving Events

- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe CLI or Dashboard
- Check webhook endpoint is publicly accessible (use ngrok for local testing)
- Verify webhook URL in Stripe Dashboard

### Payment Succeeds But Booking Not Confirmed

- Check webhook signature verification
- Verify database transaction is not failing
- Check server logs for webhook processing errors
- Ensure booking ID in metadata matches database

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

For integration issues:
- Check server logs
- Review webhook event logs in Stripe Dashboard
- Test in Stripe's test mode first
