-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "areaSize" INTEGER,
ADD COLUMN     "averageRating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "bathrooms" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "bedrooms" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "beds" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "checkInTime" TEXT DEFAULT '14:00',
ADD COLUMN     "checkOutTime" TEXT DEFAULT '11:00',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "instantBooking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "propertyType" TEXT NOT NULL DEFAULT 'APARTMENT',
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Property_propertyType_idx" ON "Property"("propertyType");

-- CreateIndex
CREATE INDEX "Property_averageRating_idx" ON "Property"("averageRating");
