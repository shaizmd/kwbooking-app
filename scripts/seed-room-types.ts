import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { config } from "dotenv";
import path from "path";

// Load .env.local explicitly
config({ path: path.join(process.cwd(), ".env.local") });

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env.local");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * This script creates default room types for properties that don't have any.
 * It's essential because the booking system requires room types to function properly.
 * 
 * Run this script with: npx tsx scripts/seed-room-types.ts
 */

async function seedRoomTypes() {
  console.log("🌱 Starting room types seed...\n");
  console.log("🔍 Finding properties without room types...\n");

  // Get all properties that don't have room types yet
  const properties = await prisma.property.findMany({
    include: {
      roomTypes: true,
    },
  });

  const propertiesWithoutRooms = properties.filter((p) => p.roomTypes.length === 0);

  if (propertiesWithoutRooms.length === 0) {
    console.log("✅ All properties already have room types!");
    console.log("\n💡 To add more room types to existing properties, use the host dashboard:");
    console.log("   Navigate to: Host Properties → Select Property → Manage Room Types\n");
    return;
  }

  console.log(`📋 Found ${propertiesWithoutRooms.length} properties without room types\n`);
  console.log("Creating default room types...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const property of propertiesWithoutRooms) {
    console.log(`\n📍 Processing: ${property.title}`);
    console.log(`   Property Type: ${property.propertyType}`);
    console.log(`   Base Price: ${property.basePrice} ${property.currency}`);
    console.log(`   Capacity: ${property.baseGuests}-${property.maxGuests} guests`);

    try {
      // Determine room type name based on property type
      let roomTypeName = "Standard Room";
      let roomTypeNameAr = "غرفة قياسية";
      let description = "Comfortable accommodation with modern amenities";

      if (property.propertyType === "APARTMENT") {
        roomTypeName = `${property.bedrooms}-Bedroom Apartment`;
        roomTypeNameAr = `شقة ${property.bedrooms} غرف نوم`;
        description = `Spacious ${property.bedrooms}-bedroom apartment with modern amenities`;
      } else if (property.propertyType === "STUDIO") {
        roomTypeName = "Studio Apartment";
        roomTypeNameAr = "شقة استوديو";
        description = "Cozy studio apartment perfect for solo travelers or couples";
      } else if (property.propertyType === "VILLA") {
        roomTypeName = `${property.bedrooms}-Bedroom Villa`;
        roomTypeNameAr = `فيلا ${property.bedrooms} غرف نوم`;
        description = `Luxurious ${property.bedrooms}-bedroom villa with private amenities`;
      }

      // Determine bed type based on number of beds
      let bedType = "1 double bed";
      if (property.beds === 1) {
        bedType = "1 double bed";
      } else if (property.beds === 2) {
        bedType = "2 single beds";
      } else if (property.beds >= 3) {
        bedType = `${property.beds} beds`;
      }

      // Create default room type
      const roomType = await prisma.roomType.create({
        data: {
          propertyId: property.id,
          name: roomTypeName,
          nameAr: roomTypeNameAr,
          description,
          bedType,
          bedCount: property.beds,
          maxGuests: property.maxGuests,
          roomSize: property.areaSize || undefined,
          basePrice: Number(property.basePrice),
          features: JSON.stringify([
            "Air conditioning",
            "Free WiFi",
            "Private bathroom",
            "Flat-screen TV",
            "Kitchen facilities",
            "Free parking",
          ]),
          isActive: true,
        },
      });

      console.log(`   ✅ Created room type: ${roomType.name}`);

      // Package 1: Standard Rate with Free Cancellation
      const standardPackage = await prisma.roomPackage.create({
        data: {
          roomTypeId: roomType.id,
          name: "Standard Rate",
          nameAr: "السعر القياسي",
          finalPrice: Number(property.basePrice),
          freeCancellation: true,
          cancellationDeadline: 24,
          cancellationDeadlineText: "before 24 hours of check-in",
          isRefundable: true,
          prepaymentRequired: false,
          noCreditCard: false,
          benefits: JSON.stringify([
            "Free WiFi",
            "Free parking",
            "24/7 customer support",
          ]),
          sortOrder: 0,
          isActive: true,
        },
      });

      console.log(`      ✅ Package 1: ${standardPackage.name} (${standardPackage.finalPrice} ${property.currency})`);

      // Package 2: Non-refundable Rate (10% discount)
      const discountedPrice = Number(property.basePrice) * 0.9;
      const nonRefundablePackage = await prisma.roomPackage.create({
        data: {
          roomTypeId: roomType.id,
          name: "Non-refundable - Save 10%",
          nameAr: "غير قابل للاسترداد - وفر 10%",
          originalPrice: Number(property.basePrice),
          finalPrice: discountedPrice,
          discountPercent: 10,
          isLimitedTime: false,
          freeCancellation: false,
          isRefundable: false,
          prepaymentRequired: true,
          noCreditCard: false,
          benefits: JSON.stringify([
            "Free WiFi",
            "Free parking",
            "10% discount",
          ]),
          sortOrder: 1,
          isActive: true,
        },
      });

      console.log(`      ✅ Package 2: ${nonRefundablePackage.name} (${nonRefundablePackage.finalPrice} ${property.currency})`);

      // Package 3: Best Deal (15% discount, limited time)
      if (property.status === "ACTIVE") {
        const bestDealPrice = Number(property.basePrice) * 0.85;
        const bestDealPackage = await prisma.roomPackage.create({
          data: {
            roomTypeId: roomType.id,
            name: "Best Deal - Limited Time",
            nameAr: "أفضل عرض - لفترة محدودة",
            originalPrice: Number(property.basePrice),
            finalPrice: bestDealPrice,
            discountPercent: 15,
            isLimitedTime: true,
            dealLabel: "Limited-time Deal",
            freeCancellation: true,
            cancellationDeadline: 48,
            cancellationDeadlineText: "before 48 hours of check-in",
            isRefundable: true,
            prepaymentRequired: false,
            noCreditCard: true,
            benefits: JSON.stringify([
              "Free WiFi",
              "Free parking",
              "15% discount",
              "Late check-in available",
            ]),
            sortOrder: 2,
            isActive: true,
          },
        });

        console.log(`      ✅ Package 3: ${bestDealPackage.name} (${bestDealPackage.finalPrice} ${property.currency})`);
      }

      successCount++;
    } catch (error) {
      console.error(`   ❌ Error creating room type: ${error}`);
      errorCount++;
    }
  }

  console.log(`\n\n${"=".repeat(60)}`);
  console.log("📊 SUMMARY");
  console.log(`${"=".repeat(60)}`);
  console.log(`✅ Successfully processed: ${successCount} properties`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} properties`);
  }
  console.log(`\n💡 Hosts can add more room types via: Host Dashboard → Properties → Manage Room Types`);
  console.log(`🔗 Active properties got 3 packages per room type; others got 2\n`);
}

// Run the seed script
seedRoomTypes()
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

