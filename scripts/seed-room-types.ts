import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedRoomTypes() {
  console.log("🌱 Starting room types seed...");

  // Get all active properties
  const properties = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    take: 5, // Seed first 5 properties as example
  });

  if (properties.length === 0) {
    console.log("No active properties found. Please create properties first.");
    return;
  }

  for (const property of properties) {
    console.log(`\n📍 Seeding room types for: ${property.title}`);

    // Create Deluxe Room Type
    const deluxeRoom = await prisma.roomType.create({
      data: {
        propertyId: property.id,
        name: "Deluxe Room",
        nameAr: "غرفة ديلوكس",
        description: "Spacious room with modern amenities and city views",
        bedType: "1 double bed",
        bedCount: 1,
        maxGuests: 2,
        roomSize: 35,
        basePrice: Number(property.basePrice) * 1.5, // 50% more than base
        features: JSON.stringify([
          "Air conditioning",
          "Private bathroom",
          "Flat-screen TV",
          "Free WiFi",
          "Mini bar",
          "Safe",
          "Work desk",
          "Coffee maker",
        ]),
      },
    });

    // Package 1: Limited Time Deal with Free Cancellation
    await prisma.roomPackage.create({
      data: {
        roomTypeId: deluxeRoom.id,
        name: "Best Deal - Limited Time",
        nameAr: "أفضل عرض - لفترة محدودة",
        originalPrice: Number(deluxeRoom.basePrice) * 2.1,
        finalPrice: Number(deluxeRoom.basePrice),
        discountPercent: 53,
        isLimitedTime: true,
        dealLabel: "Limited-time Deal",
        freeCancellation: true,
        cancellationDeadline: 48,
        cancellationDeadlineText: "before 48 hours of check-in",
        isRefundable: true,
        prepaymentRequired: false,
        noCreditCard: true,
        benefits: JSON.stringify([
          "Includes 10% off food/drink",
          "Free parking",
          "Late check-in",
          "High-speed internet",
        ]),
        sortOrder: 0,
      },
    });

    // Package 2: Non-refundable (cheaper)
    await prisma.roomPackage.create({
      data: {
        roomTypeId: deluxeRoom.id,
        name: "Non-refundable - Save More",
        nameAr: "غير قابل للاسترداد - وفر أكثر",
        originalPrice: Number(deluxeRoom.basePrice) * 1.8,
        finalPrice: Number(deluxeRoom.basePrice) * 0.87,
        discountPercent: 53,
        isLimitedTime: true,
        dealLabel: "Limited-time Deal",
        freeCancellation: false,
        isRefundable: false,
        prepaymentRequired: true,
        noCreditCard: false,
        benefits: JSON.stringify([
          "Includes 10% off food/drink",
          "Free parking",
          "Late check-in",
          "High-speed internet",
        ]),
        sortOrder: 1,
      },
    });

    // Create Standard Room Type
    const standardRoom = await prisma.roomType.create({
      data: {
        propertyId: property.id,
        name: "Standard Room",
        nameAr: "غرفة قياسية",
        description: "Comfortable room with essential amenities",
        bedType: "1 double bed",
        bedCount: 1,
        maxGuests: 2,
        roomSize: 25,
        basePrice: Number(property.basePrice),
        features: JSON.stringify([
          "Air conditioning",
          "Private bathroom",
          "Flat-screen TV",
          "Free WiFi",
        ]),
      },
    });

    // Package for Standard Room
    await prisma.roomPackage.create({
      data: {
        roomTypeId: standardRoom.id,
        name: "Flexible Rate",
        nameAr: "سعر مرن",
        finalPrice: Number(standardRoom.basePrice),
        freeCancellation: true,
        cancellationDeadline: 24,
        cancellationDeadlineText: "before 24 hours of check-in",
        isRefundable: true,
        prepaymentRequired: false,
        noCreditCard: true,
        benefits: JSON.stringify([
          "Free cancellation",
          "No credit card needed",
          "Pay at property",
          "Free WiFi",
        ]),
        sortOrder: 0,
      },
    });

    console.log(`  ✅ Created 2 room types with 3 packages for ${property.title}`);
  }

  console.log("\n✨ Room types seeding completed!");
}

seedRoomTypes()
  .catch((e) => {
    console.error("❌ Error seeding room types:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
