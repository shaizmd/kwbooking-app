# 🧪 Comprehensive Testing Guide

## 🚀 Setup & Prerequisites

### 1. Run Database Migration
```bash
# Windows PowerShell
$env:DATABASE_URL="your_database_url_from_.env.local"
npx prisma migrate dev --name add_production_hardening

# Or use the config file approach (recommended)
npx prisma migrate dev --name add_production_hardening
```

### 2. Seed Database with Test Data
```bash
# Install tsx for TypeScript execution
npm install -D tsx

# Run seed script
npx tsx src/prisma/seed.ts
```

**Test Accounts Created:**
- **Admin**: `admin@bookingapp.com` / `admin123`
- **Host (Approved)**: `host1@example.com` / `host123`
- **Host (Pending KYC)**: `host2@example.com` / `host123`
- **Customer (Verified)**: `customer1@example.com` / `customer123`
- **Customer (Unverified)**: `customer2@example.com` / `customer123`

### 3. Set Required Environment Variables
Create `.env.local` with:
```env
# Database
DATABASE_URL="your_neon_postgres_url"

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# R2/S3 Storage
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="booking-invoices"
R2_PUBLIC_URL="https://your-r2-public-url.com"

# Cron Jobs (for Vercel)
CRON_SECRET="generate-random-secret-min-32-chars"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Start Development Server
```bash
npm run dev
```

---

## 📋 Testing Checklist

### ✅ Authentication & Authorization

#### Registration Flow
1. **Navigate to**: `/en/auth/register`
2. **Test Cases**:
   - [ ] Register as CUSTOMER with valid email/password
   - [ ] Register as HOST with phone number
   - [ ] Try duplicate email (should fail)
   - [ ] Try weak password (should fail validation)
   - [ ] Verify rate limiting (max 5 requests/min)

#### Login Flow
1. **Navigate to**: `/en/auth/login`
2. **Test Cases**:
   - [ ] Login with `customer1@example.com` / `customer123`
   - [ ] Login with `host1@example.com` / `host123`
   - [ ] Login with `admin@bookingapp.com` / `admin123`
   - [ ] Try wrong password (should fail)
   - [ ] Verify rate limiting (max 5 requests/min)
   - [ ] Check JWT cookies are set in browser DevTools

#### Session Management
1. **Test Cases**:
   - [ ] Access `/en/auth/me` endpoint (should return user data)
   - [ ] Delete access token cookie, verify redirect to login
   - [ ] Test refresh token flow
   - [ ] Logout and verify cookies cleared

---

### ✅ Customer Workflow

#### Browse & Search Properties
1. **Navigate to**: `/en/properties`
2. **Test Cases**:
   - [ ] View all active properties
   - [ ] Verify only ACTIVE status properties shown
   - [ ] Check property images load
   - [ ] Test pagination (if implemented)

#### View Property Details
1. **Navigate to**: `/en/properties/[id]` (e.g., luxury villa)
2. **Test Cases**:
   - [ ] View all property details (title, description, price)
   - [ ] See host information
   - [ ] View amenities list
   - [ ] Check image gallery
   - [ ] View location on map (if implemented)

#### Create Booking
1. **Login as**: `customer1@example.com`
2. **Navigate to**: Property detail page
3. **Click**: "Book Now"
4. **Test Cases**:
   - [ ] Select check-in/check-out dates (future dates)
   - [ ] Select number of guests
   - [ ] Verify price calculation (base + extra guests)
   - [ ] Submit booking form
   - [ ] Verify redirect to payment page
   - [ ] Check booking created with PENDING status

#### Complete Payment
1. **Continue from booking creation**
2. **Test Cases**:
   - [ ] View booking summary on payment page
   - [ ] See Stripe payment form
   - [ ] Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)
   - [ ] Complete payment successfully
   - [ ] Verify redirect to success page
   - [ ] Check booking status changed to CONFIRMED
   - [ ] Verify invoice generated

#### View Bookings & Invoices
1. **Navigate to**: `/en/bookings`
2. **Test Cases**:
   - [ ] See all customer bookings
   - [ ] View confirmed booking with "Download Invoice" button
   - [ ] View pending booking with "Complete Payment" button
   - [ ] Click invoice download (should open PDF in new tab)
   - [ ] Check invoice details (booking info, amounts, dates)

---

### ✅ Host Workflow

#### Host Dashboard
1. **Login as**: `host1@example.com`
2. **Navigate to**: `/en/host/properties`
3. **Test Cases**:
   - [ ] View all host properties
   - [ ] See property status badges
   - [ ] View booking count per property
   - [ ] Access property actions

#### Create New Property
1. **Navigate to**: `/en/host/properties/new`
2. **Test Cases**:
   - [ ] Fill all required fields (title, description, location)
   - [ ] Set base price in KWD
   - [ ] Set guest capacity (base + max)
   - [ ] Set extra guest price
   - [ ] Submit form
   - [ ] Verify property created with DRAFT status
   - [ ] Check subscription limits enforced

#### Upload Property Images
1. **Navigate to**: `/en/host/properties/[id]/images`
2. **Test Cases**:
   - [ ] Upload single image
   - [ ] Upload multiple images
   - [ ] Verify R2 storage upload
   - [ ] Set display order
   - [ ] Delete image
   - [ ] Verify minimum 1 image required for publishing

#### Manage Property
1. **Edit property details**
2. **Test Cases**:
   - [ ] Update title, description
   - [ ] Change pricing
   - [ ] Modify guest capacity
   - [ ] Publish property (DRAFT → PENDING_APPROVAL)
   - [ ] Unpublish property

#### View Bookings
1. **Check incoming bookings**
2. **Test Cases**:
   - [ ] See all bookings for host properties
   - [ ] Filter by property
   - [ ] View customer details
   - [ ] Check booking dates and status

---

### ✅ Admin Panel

#### Access Admin Panel
1. **Login as**: `admin@bookingapp.com`
2. **Navigate to**: `/en/admin`
3. **Test Cases**:
   - [ ] Verify admin layout loads
   - [ ] See all navigation tabs
   - [ ] Check 403 error if non-admin tries to access

#### Dashboard
1. **Navigate to**: `/en/admin` (dashboard)
2. **Test Cases**:
   - [ ] View total users count
   - [ ] View total properties count
   - [ ] View total bookings count
   - [ ] View pending bookings count
   - [ ] View confirmed bookings count
   - [ ] View total invoices count
   - [ ] Verify counts match database

#### User Management
1. **Navigate to**: `/en/admin/users`
2. **Test Cases**:
   - [ ] View all users in table
   - [ ] See role badges (ADMIN, HOST, CUSTOMER)
   - [ ] Check verification status
   - [ ] View KYC approval status (for hosts)
   - [ ] See activity counts (properties, bookings)
   - [ ] Check join dates

#### Property Moderation
1. **Navigate to**: `/en/admin/properties`
2. **Test Cases**:
   - [ ] View all properties
   - [ ] See status badges (ACTIVE, DRAFT, PENDING_APPROVAL, BLOCKED, REJECTED)
   - [ ] View host information per property
   - [ ] Check location and pricing
   - [ ] View booking/image counts
   - [ ] Approve pending property (change status to ACTIVE)
   - [ ] Reject property with reason

#### Booking Oversight
1. **Navigate to**: `/en/admin/bookings`
2. **Test Cases**:
   - [ ] View all bookings
   - [ ] See customer and property details
   - [ ] Check booking dates with nights calculation
   - [ ] View booking status (CONFIRMED, PENDING, CANCELLED, COMPLETED)
   - [ ] Check payment status and provider
   - [ ] View amounts and currency

#### Invoice Management
1. **Navigate to**: `/en/admin/invoices`
2. **Test Cases**:
   - [ ] View all invoices
   - [ ] See invoice numbers
   - [ ] Check customer and property info
   - [ ] View booking dates
   - [ ] See amount breakdown (subtotal, tax, total)
   - [ ] Download invoice PDF
   - [ ] Verify PDF contains correct data

#### Platform Settings (Kill Switches)
1. **Navigate to**: `/en/admin/settings`
2. **Test Cases**:
   - [ ] View current settings status
   - [ ] Toggle "New Bookings" (disable/enable)
   - [ ] Toggle "Payment Processing" (disable/enable)
   - [ ] Toggle "New Property Listings" (disable/enable)
   - [ ] Submit settings form
   - [ ] Verify settings saved

#### Cron Job Monitoring
1. **Still on**: `/en/admin/settings`
2. **Test Cases**:
   - [ ] View "Expired Subscriptions" count (last 24h)
   - [ ] View "Auto-Cancelled Bookings" count (last 24h)
   - [ ] View "Expired Sessions" pending cleanup
   - [ ] Click "Run All Jobs Manually" button
   - [ ] Verify jobs executed successfully
   - [ ] Check console logs for job output

---

### ✅ Production Hardening Features

#### Rate Limiting
1. **Test Auth Endpoints**:
   - [ ] Make 6+ login requests in 1 minute
   - [ ] Verify 429 error after 5 requests
   - [ ] Check "Retry-After" header
   - [ ] Wait 1 minute, verify reset

2. **Test Payment Intent**:
   - [ ] Create 6+ payment intents in 1 hour
   - [ ] Verify rate limit triggered
   - [ ] Check error message

#### Cron Jobs (Automated)

**Subscription Expiry Job** (Daily 00:00 KWT)
1. **Manual Test**:
   - [ ] Navigate to `/api/cron/expire-subscriptions`
   - [ ] Send GET request with header: `Authorization: Bearer YOUR_CRON_SECRET`
   - [ ] Verify expired subscriptions marked as EXPIRED
   - [ ] Check properties deactivated for expired hosts

**Unpaid Booking Cancellation** (Every 15 min)
1. **Setup**:
   - [ ] Create booking, don't pay (seed data has old pending booking)
   - [ ] Wait 15+ minutes OR manually trigger cron
2. **Test**:
   - [ ] Navigate to `/api/cron/cancel-unpaid-bookings`
   - [ ] Send GET with auth header
   - [ ] Verify old pending bookings cancelled
   - [ ] Check cancellation reason set

**Session Cleanup** (Daily 02:00 KWT)
1. **Test**:
   - [ ] Navigate to `/api/cron/cleanup-sessions`
   - [ ] Send GET with auth header
   - [ ] Verify expired sessions deleted
   - [ ] Check count returned

#### Invoice Generation
1. **Test Webhook Flow**:
   - [ ] Complete payment via Stripe test card
   - [ ] Check webhook logs in terminal
   - [ ] Verify payment record created
   - [ ] Verify booking status changed to CONFIRMED
   - [ ] Verify invoice PDF generated
   - [ ] Verify invoice uploaded to R2
   - [ ] Verify invoice record created with PDF URL

2. **Test Invoice Download**:
   - [ ] Navigate to booking success page
   - [ ] Click "Download Invoice" button
   - [ ] Verify PDF opens in new tab
   - [ ] Check PDF contains:
     - Invoice number
     - Booking details
     - Customer info
     - Property info
     - Price breakdown
     - Dates and payment info

#### Error Logging
1. **Check Terminal Logs**:
   - [ ] Trigger payment failure (use `4000 0000 0000 0002`)
   - [ ] Check structured error log with context
   - [ ] Verify error contains userId, bookingId, etc.

2. **Check Webhook Logs**:
   - [ ] Send invalid webhook signature
   - [ ] Check error logged with category "WEBHOOK"

3. **Check Cron Logs**:
   - [ ] Run cron job
   - [ ] Verify structured logs with category "CRON"
   - [ ] Check success/failure messages

---

## 🐛 Common Issues & Troubleshooting

### Database Connection Issues
- **Error**: "DATABASE_URL environment variable is not set"
- **Fix**: Ensure `.env.local` exists with correct DATABASE_URL

### Stripe Webhook Not Working
- **Error**: Webhook signature verification failed
- **Fix**: 
  1. Install Stripe CLI: `stripe login`
  2. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  3. Copy webhook secret to `.env.local`

### R2 Upload Fails
- **Error**: "Access denied" or "Bucket not found"
- **Fix**: 
  1. Verify R2 credentials in `.env.local`
  2. Check bucket name matches
  3. Verify CORS settings on R2 bucket

### Rate Limiting Not Working
- **Note**: Rate limiting uses in-memory storage
- **Fix**: Restart server to clear rate limit state

### Cron Jobs Don't Run
- **Error**: "Unauthorized"
- **Fix**: Send correct `Authorization: Bearer ${CRON_SECRET}` header

---

## 🎯 Success Criteria

After completing all tests, verify:

- ✅ All user roles work (CUSTOMER, HOST, ADMIN)
- ✅ Authentication and authorization enforced
- ✅ Booking flow completes end-to-end
- ✅ Payment processing works with Stripe
- ✅ Invoices generated and downloadable
- ✅ Admin panel shows all data correctly
- ✅ Kill switches work (disable features)
- ✅ Rate limiting protects endpoints
- ✅ Cron jobs can be triggered manually
- ✅ Error logging captures issues

---

## 📝 Test Results Template

Create a file to track your testing:

```
# Test Results - [Date]

## Authentication ✅/❌
- Registration: ✅
- Login: ✅
- Rate limiting: ✅

## Customer Flow ✅/❌
- Browse properties: ✅
- Create booking: ✅
- Complete payment: ❌ (Issue: XYZ)
- View invoices: ✅

## Host Flow ✅/❌
- Create property: ✅
- Upload images: ✅
- View bookings: ✅

## Admin Panel ✅/❌
- Dashboard: ✅
- User management: ✅
- Property moderation: ✅
- Settings page: ✅

## Production Features ✅/❌
- Rate limiting: ✅
- Cron jobs: ✅
- Invoice generation: ✅
- Error logging: ✅

## Issues Found
1. [Issue description]
2. [Issue description]
```

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] Set all production environment variables
- [ ] Update Stripe keys to live mode
- [ ] Configure R2 production bucket
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS only cookies
- [ ] Configure Vercel cron jobs
- [ ] Set up error monitoring (Sentry)
- [ ] Test all kill switches
- [ ] Verify rate limiting in production
- [ ] Test payment flow with real card
- [ ] Backup database
- [ ] Document admin procedures

---

**Happy Testing! 🎉**
