import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { differenceInCalendarDays } from "date-fns";

export default async function PublicPropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    rooms?: string;
  }>;
}) {
  const { locale } = await params;
  const { q, type, sort, minPrice, maxPrice, checkIn, checkOut, adults, children, rooms } = await searchParams;
  const t = await getTranslations("properties");
  const query = q?.trim();

  const adultsCount = Math.max(1, Number.parseInt(adults ?? "2", 10) || 2);
  const childrenCount = Math.max(0, Number.parseInt(children ?? "0", 10) || 0);
  const roomsCount = Math.max(1, Number.parseInt(rooms ?? "1", 10) || 1);
  const totalGuests = adultsCount + childrenCount;

  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const hasValidDates =
    checkInDate instanceof Date &&
    checkOutDate instanceof Date &&
    !Number.isNaN(checkInDate.getTime()) &&
    !Number.isNaN(checkOutDate.getTime()) &&
    checkOutDate > checkInDate;

  // Check if user is logged in
  let userId: string | null = null;
  let wishlistPropertyIds: string[] = [];
  
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (token) {
    try {
      const payload = await verifyAccessToken(token);
      userId = payload.sub;
      
      // Get user's wishlist
      const wishlist = await prisma.wishlist.findMany({
        where: { userId },
        select: { propertyId: true },
      });
      wishlistPropertyIds = wishlist.map(w => w.propertyId);
    } catch {
      // Invalid token, user not logged in
    }
  }

  // Build filter conditions
  const whereClause: Prisma.PropertyWhereInput = {
    status: "ACTIVE",
  };

  if (type && type !== "all") {
    whereClause.propertyType = type.toUpperCase();
  }

  if (minPrice || maxPrice) {
    whereClause.basePrice = {};
    if (minPrice) whereClause.basePrice.gte = parseFloat(minPrice);
    if (maxPrice) whereClause.basePrice.lte = parseFloat(maxPrice);
  }

  if (totalGuests > 0) {
    whereClause.maxGuests = { gte: totalGuests };
  }

  if (roomsCount > 0) {
    whereClause.bedrooms = { gte: roomsCount };
  }

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { titleAr: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
      { locationAr: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
      { addressAr: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { cityAr: { contains: query, mode: "insensitive" } },
      { district: { contains: query, mode: "insensitive" } },
      { districtAr: { contains: query, mode: "insensitive" } },
      { country: { contains: query, mode: "insensitive" } },
    ];
  }

  // Note: We no longer filter out unavailable properties here
  // so we can show them with "Sold out" badge

  // Build order by
  let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
  
  if (sort === "price-low") {
    orderBy = { basePrice: "asc" };
  } else if (sort === "price-high") {
    orderBy = { basePrice: "desc" };
  } else if (sort === "rating") {
    orderBy = { averageRating: "desc" };
  } else if (sort === "featured") {
    orderBy = { featured: "desc" };
  }

  const properties = await prisma.property.findMany({
    where: whereClause,
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      amenities: {
        take: 5,
        include: {
          amenity: true,
        },
      },
      blockedDates: hasValidDates && checkInDate && checkOutDate ? {
        where: {
          startDate: { lte: checkOutDate },
          endDate: { gte: checkInDate },
        },
      } : false,
      bookings: hasValidDates && checkInDate && checkOutDate ? {
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      } : false,
    },
    orderBy,
  });

  const stayNights = hasValidDates && checkInDate && checkOutDate
    ? Math.max(1, differenceInCalendarDays(checkOutDate, checkInDate))
    : 1;

  const computedProperties = properties
    .map((property) => {
      const baseGuestsPerRoom = Math.max(1, property.baseGuests);
      const requiredRooms = Math.max(roomsCount, Math.ceil(totalGuests / baseGuestsPerRoom));

      if (requiredRooms > property.bedrooms) {
        return null;
      }

      const includedGuests = baseGuestsPerRoom * requiredRooms;
      const extraGuests = Math.max(0, totalGuests - includedGuests);
      const extraGuestPrice = property.extraGuestPrice ? Number(property.extraGuestPrice) : 0;
      const basePrice = Number(property.basePrice);
      const totalPrice = (basePrice * stayNights * requiredRooms) + (extraGuestPrice * extraGuests * stayNights);

      // Check if property is sold out for selected dates
      const isSoldOut = hasValidDates && (
        (property.blockedDates && Array.isArray(property.blockedDates) && property.blockedDates.length > 0) ||
        (property.bookings && Array.isArray(property.bookings) && property.bookings.length > 0)
      );

      return {
        property,
        isSoldOut,
        pricing: {
          nights: stayNights,
          totalPrice,
          currency: property.currency,
          extraGuests,
          requiredRooms,
          roomNote: requiredRooms > roomsCount
            ? `Rooms adjusted to ${requiredRooms} to fit ${totalGuests} guests`
            : null,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const propertyTypes = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: { propertyType: true },
    distinct: ["propertyType"],
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="text-white" style={{ backgroundColor: 'var(--red)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-semibold mb-2">
            {t("title")}
          </h1>
          <p className="text-sm" style={{ opacity: 0.9 }}>
            {computedProperties.length} {computedProperties.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-80 shrink-0">
            <PropertyFilters
              propertyTypes={propertyTypes.map((pt) => pt.propertyType)}
              currentType={type}
              currentSort={sort}
              currentMinPrice={minPrice}
              currentMaxPrice={maxPrice}
            />
          </div>

          {/* Properties List */}
          <div className="flex-1">
            {computedProperties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {t("noProperties")}
                </h3>
                <p className="text-gray-600">
                  {t("noPropertiesDesc")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {computedProperties.map((item, index) => (
                  <PropertyCard 
                    key={item.property.id}
                    property={{
                      id: item.property.id,
                      title: item.property.title,
                      titleAr: item.property.titleAr,
                      description: item.property.description,
                      location: item.property.location,
                      basePrice: Number(item.property.basePrice),
                      currency: item.property.currency,
                      baseGuests: item.property.baseGuests,
                      maxGuests: item.property.maxGuests,
                      extraGuestPrice: item.property.extraGuestPrice ? Number(item.property.extraGuestPrice) : null,
                      bedrooms: item.property.bedrooms,
                      bathrooms: item.property.bathrooms,
                      beds: item.property.beds,
                      areaSize: item.property.areaSize,
                      propertyType: item.property.propertyType,
                      averageRating: item.property.averageRating ? Number(item.property.averageRating) : null,
                      reviewCount: item.property.reviewCount,
                      featured: item.property.featured,
                      instantBooking: item.property.instantBooking,
                      images: item.property.images,
                      amenities: item.property.amenities,
                    }}
                    pricing={item.pricing}
                    isSoldOut={item.isSoldOut}
                    locale={locale}
                    index={index}
                    userId={userId}
                    isInWishlist={wishlistPropertyIds.includes(item.property.id)}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    adults={adults}
                    children={children}
                    rooms={rooms}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
