-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "guestEmail" TEXT NOT NULL DEFAULT 'guest@example.com',
ADD COLUMN     "guestFullName" TEXT NOT NULL DEFAULT 'Guest',
ADD COLUMN     "guestPhone" TEXT,
ADD COLUMN     "packageId" TEXT,
ADD COLUMN     "roomCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "roomTypeId" TEXT,
ADD COLUMN     "specialRequests" TEXT,
ADD COLUMN     "visitPurpose" TEXT;

-- CreateTable
CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "bedType" TEXT NOT NULL,
    "bedCount" INTEGER NOT NULL DEFAULT 1,
    "roomSize" INTEGER,
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "features" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomPackage" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "originalPrice" DECIMAL(65,30),
    "finalPrice" DECIMAL(65,30) NOT NULL,
    "discountPercent" INTEGER,
    "isLimitedTime" BOOLEAN NOT NULL DEFAULT false,
    "dealLabel" TEXT,
    "freeCancellation" BOOLEAN NOT NULL DEFAULT false,
    "cancellationDeadline" INTEGER,
    "cancellationDeadlineText" TEXT,
    "isRefundable" BOOLEAN NOT NULL DEFAULT true,
    "prepaymentRequired" BOOLEAN NOT NULL DEFAULT false,
    "noCreditCard" BOOLEAN NOT NULL DEFAULT false,
    "benefits" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomType_propertyId_idx" ON "RoomType"("propertyId");

-- CreateIndex
CREATE INDEX "RoomType_isActive_idx" ON "RoomType"("isActive");

-- CreateIndex
CREATE INDEX "RoomPackage_roomTypeId_idx" ON "RoomPackage"("roomTypeId");

-- CreateIndex
CREATE INDEX "RoomPackage_isActive_idx" ON "RoomPackage"("isActive");

-- CreateIndex
CREATE INDEX "Booking_roomTypeId_idx" ON "Booking"("roomTypeId");

-- CreateIndex
CREATE INDEX "Booking_packageId_idx" ON "Booking"("packageId");

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomPackage" ADD CONSTRAINT "RoomPackage_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "RoomPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
