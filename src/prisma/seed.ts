/**
 * Database Seed Script
 * 
 * Run with: npx tsx src/prisma/seed.ts
 * Or add to package.json: "prisma": { "seed": "tsx src/prisma/seed.ts" }
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { config } from "dotenv";
import path from "path";

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env.local");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (optional - comment out in production)
  console.log("🧹 Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.review.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.property.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  console.log("👤 Creating users...");
  
  const adminPassword = await hashPassword("admin123");
  const hostPassword = await hashPassword("host123");
  const customerPassword = await hashPassword("customer123");

  const admin = await prisma.user.create({
    data: {
      email: "admin@bookingapp.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      fullName: "Admin User",
      phone: "+96512345678",
      isVerified: true,
      isKycApproved: true,
    },
  });

  const host1 = await prisma.user.create({
    data: {
      email: "host1@example.com",
      passwordHash: hostPassword,
      role: "HOST",
      fullName: "Ahmed Al-Mansour",
      phone: "+96512345679",
      nationalId: "123456789",
      isVerified: true,
      isKycApproved: true,
    },
  });

  const host2 = await prisma.user.create({
    data: {
      email: "host2@example.com",
      passwordHash: hostPassword,
      role: "HOST",
      fullName: "Fatima Al-Salem",
      phone: "+96512345680",
      nationalId: "987654321",
      isVerified: true,
      isKycApproved: false, // Pending KYC
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "customer1@example.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      fullName: "Mohammed Al-Rashid",
      phone: "+96512345681",
      isVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "customer2@example.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      fullName: "Sara Al-Khalifa",
      phone: "+96512345682",
      isVerified: false, // Unverified account
    },
  });

  console.log(`✅ Created ${5} users`);

  // 2. Create Subscriptions for Hosts
  console.log("💳 Creating subscriptions...");

  const _activeSubscription = await prisma.subscription.create({
    data: {
      hostId: host1.id,
      planName: "Premium",
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: "ACTIVE",
      maxListings: 10,
      commissionRate: 8.5,
      paymentProvider: "stripe",
    },
  });

  const _expiredSubscription = await prisma.subscription.create({
    data: {
      hostId: host2.id,
      planName: "Basic",
      startsAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      endsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Expired 30 days ago
      status: "EXPIRED",
      maxListings: 3,
      commissionRate: 10,
      paymentProvider: "stripe",
    },
  });

  console.log(`✅ Created ${2} subscriptions`);

  // 3. Create Properties
  console.log("🏠 Creating properties...");

  const property1 = await prisma.property.create({
    data: {
      hostId: host1.id,
      propertyType: "VILLA",
      title: "Luxury Beach Villa in Salmiya",
      titleAr: "فيلا شاطئية فاخرة في السالمية",
      description: "Stunning 4-bedroom beachfront villa with private pool, modern amenities, and breathtaking sea views. Perfect for families and groups. Features spacious living areas, fully equipped kitchen, and direct beach access.",
      descriptionAr: "فيلا رائعة من 4 غرف نوم على الشاطئ مع مسبح خاص ووسائل راحة حديثة وإطلالات خلابة على البحر",
      location: "Salmiya, Kuwait",
      locationAr: "السالمية، الكويت",
      address: "Beach Road, Block 12, Street 9",
      addressAr: "شارع الشاطئ، قطعة 12، شارع 9",
      city: "Salmiya",
      cityAr: "السالمية",
      district: "Al Salmiya",
      districtAr: "السالمية",
      postalCode: "22013",
      country: "Kuwait",
      countryCode: "KW",
      latitude: 29.3459,
      longitude: 48.0759,
      distanceToCenter: 12.5,
      nearestAirport: "Kuwait International Airport",
      airportDistance: 15.3,
      basePrice: 150.5,
      currency: "KWD",
      baseGuests: 4,
      maxGuests: 8,
      extraGuestPrice: 20.0,
      bedrooms: 4,
      bathrooms: 3,
      beds: 5,
      areaSize: 350,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      averageRating: 4.8,
      reviewCount: 47,
      featured: true,
      instantBooking: true,
      status: "ACTIVE",
      slug: "luxury-beach-villa-salmiya",
    },
  });

  const property2 = await prisma.property.create({
    data: {
      hostId: host1.id,
      propertyType: "APARTMENT",
      title: "Modern Apartment in Kuwait City",
      titleAr: "شقة حديثة في مدينة الكويت",
      description: "2-bedroom furnished apartment in the heart of Kuwait City. Walking distance to shopping malls and restaurants. Features modern decor, high-speed WiFi, and a fully equipped kitchen.",
      descriptionAr: "شقة مفروشة من غرفتي نوم في قلب مدينة الكويت",
      location: "Kuwait City, Kuwait",
      locationAr: "مدينة الكويت، الكويت",
      address: "Arabian Gulf Street, Tower 5, Floor 8",
      addressAr: "شارع الخليج العربي، برج 5، الطابق 8",
      city: "Kuwait City",
      cityAr: "مدينة الكويت",
      district: "Sharq",
      districtAr: "الشرق",
      postalCode: "15300",
      country: "Kuwait",
      countryCode: "KW",
      latitude: 29.3759,
      longitude: 47.9774,
      distanceToCenter: 2.1,
      nearestAirport: "Kuwait International Airport",
      airportDistance: 18.7,
      basePrice: 80.0,
      currency: "KWD",
      baseGuests: 2,
      maxGuests: 4,
      extraGuestPrice: 15.0,
      bedrooms: 2,
      bathrooms: 2,
      beds: 2,
      areaSize: 120,
      floor: 8,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      averageRating: 4.5,
      reviewCount: 32,
      featured: false,
      instantBooking: true,
      status: "ACTIVE",
      slug: "modern-apartment-kuwait-city",
    },
  });

  const property3 = await prisma.property.create({
    data: {
      hostId: host2.id,
      propertyType: "STUDIO",
      title: "Cozy Studio in Hawalli",
      titleAr: "استوديو مريح في حولي",
      description: "Affordable studio apartment, perfect for solo travelers or couples. Close to public transport. Compact yet comfortable with all essential amenities.",
      descriptionAr: "شقة استوديو بأسعار معقولة، مثالية للمسافرين المنفردين أو الأزواج",
      location: "Hawalli, Kuwait",
      locationAr: "حولي، الكويت",
      address: "Tunis Street, Building 42",
      addressAr: "شارع تونس، مبنى 42",
      city: "Hawalli",
      cityAr: "حولي",
      district: "Hawalli Center",
      districtAr: "وسط حولي",
      postalCode: "32041",
      country: "Kuwait",
      countryCode: "KW",
      latitude: 29.3329,
      longitude: 48.0289,
      distanceToCenter: 8.3,
      nearestAirport: "Kuwait International Airport",
      airportDistance: 12.1,
      basePrice: 45.0,
      currency: "KWD",
      baseGuests: 2,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      areaSize: 45,
      floor: 3,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      averageRating: 4.2,
      reviewCount: 18,
      featured: false,
      instantBooking: false,
      status: "PENDING_APPROVAL",
      slug: "cozy-studio-hawalli",
    },
  });

  const _property4 = await prisma.property.create({
    data: {
      hostId: host1.id,
      propertyType: "VILLA",
      title: "Family Villa with Garden",
      description: "Spacious 5-bedroom villa with large garden and barbecue area. Ideal for large families or group gatherings.",
      location: "Fintas, Kuwait",
      latitude: 29.1739,
      longitude: 48.1249,
      basePrice: 200.0,
      currency: "KWD",
      baseGuests: 6,
      maxGuests: 12,
      extraGuestPrice: 18.0,
      bedrooms: 5,
      bathrooms: 4,
      beds: 7,
      areaSize: 450,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      averageRating: 4.6,
      reviewCount: 25,
      featured: true,
      instantBooking: false,
      status: "ACTIVE",
      slug: "family-villa-fintas",
    },
  });

  console.log(`✅ Created ${4} properties`);

  // 4. Add Property Images
  console.log("📸 Adding property images...");

  await prisma.propertyImage.createMany({
    data: [
      // Property 1 images
      { propertyId: property1.id, imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811", order: 1 },
      { propertyId: property1.id, imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750", order: 2 },
      { propertyId: property1.id, imageUrl: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6", order: 3 },
      // Property 2 images
      { propertyId: property2.id, imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", order: 1 },
      { propertyId: property2.id, imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2", order: 2 },
      // Property 3 images
      { propertyId: property3.id, imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb", order: 1 },
    ],
  });

  console.log(`✅ Added ${6} property images`);

  // 5. Create Amenities (Master List)
  console.log("✨ Creating amenities...");

  const amenities = await Promise.all([
    prisma.amenity.create({ data: { name: "WiFi", nameAr: "واي فاي", icon: "wifi", category: "wifi" } }),
    prisma.amenity.create({ data: { name: "Private Pool", nameAr: "مسبح خاص", icon: "pool", category: "pool" } }),
    prisma.amenity.create({ data: { name: "Air Conditioning", nameAr: "تكييف", icon: "ac", category: "ac" } }),
    prisma.amenity.create({ data: { name: "Parking", nameAr: "موقف سيارات", icon: "parking", category: "parking" } }),
    prisma.amenity.create({ data: { name: "Kitchen", nameAr: "مطبخ", icon: "kitchen", category: "kitchen" } }),
    prisma.amenity.create({ data: { name: "Elevator", nameAr: "مصعد", icon: "elevator", category: "elevator" } }),
  ]);

  const [wifiAmenity, poolAmenity, acAmenity, parkingAmenity, kitchenAmenity, elevatorAmenity] = amenities;

  console.log(`✅ Created ${amenities.length} amenities`);

  // 6. Link Amenities to Properties
  console.log("🔗 Linking amenities to properties...");

  await prisma.propertyAmenity.createMany({
    data: [
      // Property 1 amenities
      { propertyId: property1.id, amenityId: wifiAmenity.id },
      { propertyId: property1.id, amenityId: poolAmenity.id },
      { propertyId: property1.id, amenityId: acAmenity.id },
      { propertyId: property1.id, amenityId: parkingAmenity.id },
      { propertyId: property1.id, amenityId: kitchenAmenity.id },
      // Property 2 amenities
      { propertyId: property2.id, amenityId: wifiAmenity.id },
      { propertyId: property2.id, amenityId: acAmenity.id },
      { propertyId: property2.id, amenityId: elevatorAmenity.id },
      // Property 3 amenities
      { propertyId: property3.id, amenityId: wifiAmenity.id },
      { propertyId: property3.id, amenityId: acAmenity.id },
    ],
  });

  console.log(`✅ Linked amenities to properties`);

  // 7. Create Bookings (various states)
  console.log("📅 Creating bookings...");

  const confirmedBooking = await prisma.booking.create({
    data: {
      propertyId: property1.id,
      customerId: customer1.id,
      checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      guests: 4,
      guestFullName: "Ahmad Al-Mansoori",
      guestEmail: "customer@example.com",
      guestPhone: "+965 9999 0001",
      arrivalTime: "14:00 - 15:00",
      subtotal: 451.5, // 3 nights * 150.5
      extraCharges: 0,
      totalAmount: 451.5,
      currency: "KWD",
      status: "CONFIRMED",
    },
  });

  const _pendingBooking = await prisma.booking.create({
    data: {
      propertyId: property2.id,
      customerId: customer1.id,
      checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      checkOut: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
      guests: 2,
      guestFullName: "Ahmad Al-Mansoori",
      guestEmail: "customer@example.com",
      subtotal: 240.0, // 3 nights * 80
      extraCharges: 0,
      totalAmount: 240.0,
      currency: "KWD",
      status: "PENDING", // Awaiting payment
    },
  });

  const _oldPendingBooking = await prisma.booking.create({
    data: {
      propertyId: property2.id,
      customerId: customer2.id,
      checkIn: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      guests: 2,
      guestFullName: "Sarah Al-Khalifa",
      guestEmail: "customer2@example.com",
      subtotal: 160.0,
      extraCharges: 0,
      totalAmount: 160.0,
      currency: "KWD",
      status: "PENDING",
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // Created 30 minutes ago (should be auto-cancelled)
    },
  });

  const _completedBooking = await prisma.booking.create({
    data: {
      propertyId: property1.id,
      customerId: customer2.id,
      checkIn: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      checkOut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      guests: 6,
      guestFullName: "Sarah Al-Khalifa",
      guestEmail: "customer2@example.com",
      guestPhone: "+965 9999 0002",
      specialRequests: "High floor, non-smoking room",
      subtotal: 491.5, // 3 nights * 150.5 + 2 extra guests * 20 * 3
      extraCharges: 120.0,
      totalAmount: 611.5,
      currency: "KWD",
      status: "COMPLETED",
    },
  });

  console.log(`✅ Created ${4} bookings`);

  // 8. Create Payment for Confirmed Booking
  console.log("💰 Creating payments...");

  const _payment = await prisma.payment.create({
    data: {
      bookingId: confirmedBooking.id,
      provider: "stripe",
      providerRef: "pi_test_1234567890",
      amount: 451.5,
      currency: "KWD",
      status: "SUCCESS",
    },
  });

  console.log(`✅ Created payment`);

  // 9. Create Invoice for Confirmed Booking
  console.log("📄 Creating invoices...");

  const _invoice = await prisma.invoice.create({
    data: {
      bookingId: confirmedBooking.id,
      invoiceNumber: "INV-2026-000001",
      subtotal: 451.5,
      taxAmount: 0,
      totalAmount: 451.5,
      currency: "KWD",
      pdfUrl: "https://example.com/invoices/INV-2026-000001.pdf",
    },
  });

  console.log(`✅ Created invoice`);

  // 10. Create Platform Settings
  console.log("⚙️ Creating platform settings...");

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      bookingsEnabled: true,
      paymentsEnabled: true,
      newPropertiesEnabled: true,
    },
    update: {},
  });

  console.log(`✅ Created platform settings`);

  // 10. Create Sample Audit Logs
  console.log("📋 Creating audit logs...");

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "PROPERTY_APPROVED",
        entityType: "Property",
        entityId: property1.id,
        metadata: JSON.stringify({ propertyTitle: property1.title }),
        ipAddress: "192.168.1.1",
      },
      {
        userId: admin.id,
        action: "USER_KYC_APPROVED",
        entityType: "User",
        entityId: host1.id,
        metadata: JSON.stringify({ userEmail: host1.email }),
        ipAddress: "192.168.1.1",
      },
    ],
  });

  console.log(`✅ Created audit logs`);

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("📝 Test Accounts:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:     admin@bookingapp.com / admin123");
  console.log("Host 1:    host1@example.com / host123 (KYC approved)");
  console.log("Host 2:    host2@example.com / host123 (KYC pending)");
  console.log("Customer 1: customer1@example.com / customer123 (verified)");
  console.log("Customer 2: customer2@example.com / customer123 (unverified)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
