-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressAr" TEXT,
ADD COLUMN     "airportDistance" DOUBLE PRECISION,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "cityAr" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Kuwait',
ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT 'KW',
ADD COLUMN     "distanceToCenter" DOUBLE PRECISION,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "districtAr" TEXT,
ADD COLUMN     "nearestAirport" TEXT,
ADD COLUMN     "postalCode" TEXT;
