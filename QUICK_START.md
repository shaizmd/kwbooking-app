# 🎯 Quick Start Guide

## 1️⃣ Initial Setup (One-Time)

### Install Dependencies
```bash
npm install
npm install -D tsx
```

### Configure Environment
Create `.env.local` in project root:
```env
# Database
DATABASE_URL="your_neon_postgres_connection_string"

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET="your-secret-key-min-32-characters-here"
JWT_REFRESH_SECRET="your-refresh-key-min-32-characters-here"

# Stripe (get from stripe.com/test)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Get this after setting up webhook

# Cloudflare R2 (or any S3-compatible storage)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="booking-invoices"
R2_PUBLIC_URL="https://your-r2-public-url.com"

# Cron Jobs (for production)
CRON_SECRET="generate-random-secret-for-cron-endpoints"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Setup Database
```bash
# Run migration to create tables
npm run db:migrate

# Generate Prisma Client
npm run db:generate

# Seed test data (5 users, 4 properties, 4 bookings)
npm run db:seed
```

---

## 2️⃣ Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 3️⃣ Test Accounts (From Seed Data)

### Admin Account
```
Email: admin@bookingapp.com
Password: admin123
Access: Full admin panel
```

### Host Accounts
```
Host 1 (KYC Approved):
Email: host1@example.com
Password: host123
Can create and manage properties

Host 2 (KYC Pending):
Email: host2@example.com
Password: host123
Awaiting KYC approval
```

### Customer Accounts
```
Customer 1 (Verified):
Email: customer1@example.com
Password: customer123
Can book properties

Customer 2 (Unverified):
Email: customer2@example.com
Password: customer123
Email verification pending
```

---

## 4️⃣ Testing Workflow

### Test Customer Booking
1. Login as **customer1@example.com**
2. Go to **/properties**
3. Click on "Luxury Beach Villa in Salmiya"
4. Click "Book Now"
5. Select dates and guests
6. Submit booking
7. Pay with Stripe test card: **4242 4242 4242 4242**
8. View booking and download invoice

### Test Host Property Management
1. Login as **host1@example.com**
2. Go to **/host/properties**
3. Click "List New Property"
4. Fill property details
5. Go to Images tab and upload photos
6. Publish property (status: PENDING_APPROVAL)
7. Wait for admin approval

### Test Admin Panel
1. Login as **admin@bookingapp.com**
2. Go to **/admin**
3. View dashboard metrics
4. Navigate to **/admin/properties**
5. Approve pending property
6. Go to **/admin/settings**
7. Test kill switches (toggle on/off)
8. Run maintenance jobs manually

---

## 5️⃣ Stripe Webhook Setup (Local Testing)

### Install Stripe CLI
```bash
# Windows
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe
```bash
stripe login
```

### Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll get a webhook secret like `whsec_...` - add it to `.env.local`

### Test Payment
1. Keep webhook listener running
2. Complete a booking payment
3. Watch terminal for webhook events
4. Verify booking confirmed and invoice generated

---

## 6️⃣ Common Commands

```bash
# Start dev server
npm run dev

# Run database migration
npm run db:migrate

# Regenerate Prisma Client
npm run db:generate

# Seed test data
npm run db:seed

# Build for production
npm run build

# Start production server
npm start
```

---

## 7️⃣ Testing Production Features

### Rate Limiting
Try making 6+ login requests in 1 minute - should get 429 error

### Cron Jobs
Manually trigger from admin settings or call:
```bash
# Subscription expiry
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/expire-subscriptions

# Unpaid bookings
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/cancel-unpaid-bookings

# Session cleanup
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/cleanup-sessions
```

### Kill Switches
1. Login as admin
2. Go to `/admin/settings`
3. Disable "New Bookings"
4. Try to create booking as customer (should fail)
5. Re-enable in admin settings

---

## 8️⃣ Verify Everything Works

Use this checklist:

- [ ] Can register new account
- [ ] Can login with test accounts
- [ ] Can browse properties
- [ ] Can create booking as customer
- [ ] Can pay with Stripe test card
- [ ] Payment webhook processes successfully
- [ ] Invoice PDF generated and downloadable
- [ ] Host can create new property
- [ ] Host can upload images
- [ ] Admin can view dashboard metrics
- [ ] Admin can approve properties
- [ ] Admin can toggle kill switches
- [ ] Rate limiting works on auth endpoints
- [ ] Cron jobs can be triggered manually

---

## 🆘 Troubleshooting

### "DATABASE_URL not found"
**Solution**: Create `.env.local` file with DATABASE_URL

### "Webhook signature verification failed"
**Solution**: 
1. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copy the webhook secret to `.env.local`
3. Restart dev server

### "R2_BUCKET_NAME not found"
**Solution**: Either:
1. Set up Cloudflare R2 bucket and add credentials to `.env.local`
2. Or use local file storage (modify invoice generation code)

### "Can't connect to database"
**Solution**: 
1. Check DATABASE_URL in `.env.local`
2. Verify Neon database is active
3. Check connection pooling settings

### "Module not found" errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

---

## 📚 Additional Resources

- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing instructions
- [WORKFLOW_VERIFICATION.md](WORKFLOW_VERIFICATION.md) - Complete system architecture
- [PRODUCTION_HARDENING.md](PRODUCTION_HARDENING.md) - Production features overview

---

**🎉 You're all set! Start with `npm run dev` and test the system!**
