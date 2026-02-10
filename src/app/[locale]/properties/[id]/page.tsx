import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import PropertyMap from "@/components/PropertyMap";
import RoomSelection from "@/components/RoomSelection";
import WishlistButton from "@/components/WishlistButton";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";

// Amenity icon mapping (booking.com style)
const getAmenityIcon = (iconName: string): ReactNode => {
  const icons: { [key: string]: ReactNode } = {
    wifi: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    parking: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    pool: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    gym: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
    ac: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    tv: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    kitchen: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    breakfast: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    shower: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    service: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    family: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    smoking: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  };
  return icons[iconName] || icons['service'];
};

export default async function PropertyDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string; adults?: string; children?: string; rooms?: string; error?: string }>;
}) {
  const { locale, id } = await params;
  const { checkIn, checkOut, adults, children, rooms, error } = await searchParams;

  // Check if user is logged in
  let userId: string | null = null;
  let isInWishlist = false;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (token) {
    try {
      const payload = await verifyAccessToken(token);
      userId = payload.sub;
      
      // Check if property is in wishlist
      const wishlistItem = await prisma.wishlist.findFirst({
        where: { userId, propertyId: id },
      });
      isInWishlist = !!wishlistItem;
    } catch {
      // Invalid token
    }
  }

  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const hasValidDates =
    checkInDate instanceof Date &&
    checkOutDate instanceof Date &&
    !Number.isNaN(checkInDate.getTime()) &&
    !Number.isNaN(checkOutDate.getTime()) &&
    checkOutDate > checkInDate;

  const property = await prisma.property.findFirst({
    where: {
      id,
      status: "ACTIVE",
    },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      amenities: {
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
      roomTypes: {
        where: { isActive: true },
        include: {
          packages: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!property) {
    notFound();
  }

  // Check if property is sold out
  const isSoldOut = hasValidDates && (
    ((property as any).blockedDates?.length > 0) ||
    ((property as any).bookings?.length > 0)
  );

  const coverImage = property.images[0];
  const otherImages = property.images.slice(1, 5); // Show up to 4 more images

  // Calculate nights if dates provided
  const nights = checkIn && checkOut 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 2; // Default to 2 nights

  // Format room types for RoomSelection component
  const formattedRoomTypes = property.roomTypes.map(rt => ({
    id: rt.id,
    name: rt.name,
    bedType: rt.bedType,
    maxGuests: rt.maxGuests,
    roomSize: rt.roomSize,
    features: rt.features ? JSON.parse(rt.features) : [],
    packages: rt.packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : null,
      finalPrice: Number(pkg.finalPrice),
      discountPercent: pkg.discountPercent,
      isLimitedTime: pkg.isLimitedTime,
      dealLabel: pkg.dealLabel,
      freeCancellation: pkg.freeCancellation,
      cancellationDeadlineText: pkg.cancellationDeadlineText,
      isRefundable: pkg.isRefundable,
      prepaymentRequired: pkg.prepaymentRequired,
      noCreditCard: pkg.noCreditCard,
      benefits: pkg.benefits ? JSON.parse(pkg.benefits) : [],
    })),
  }));

  const defaultCheckIn = checkIn || new Date().toISOString().split("T")[0];
  const checkOutBase = new Date();
  checkOutBase.setDate(checkOutBase.getDate() + nights);
  const defaultCheckOut = checkOut || checkOutBase.toISOString().split("T")[0];
  const adultsCount = Math.max(1, Number.parseInt(adults ?? "2", 10) || 2);
  const childrenCount = Math.max(0, Number.parseInt(children ?? "0", 10) || 0);

  return (
    <div className="bg-white min-h-screen">
      {/* Header Strip with Back Button */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/${locale}/properties`}
            className="inline-flex items-center font-medium transition-colors" style={{ color: 'var(--red)' }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to search results
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error/Sold Out Messages */}
        {(error || isSoldOut) && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-red-700">
                  {error === 'Property not available' || error === 'Dates not available' || isSoldOut 
                    ? 'Sold out on your dates! Please try different dates or another property.' 
                    : error || 'This property is not available for the selected dates.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Property Title & Location */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {property.title}
                </h1>
                {property.featured && (
                  <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded shadow-sm">
                    ⭐ Featured Property
                  </span>
                )}
              </div>
            </div>
            {userId && (
              <WishlistButton
                propertyId={property.id}
                locale={locale}
                isInWishlist={isInWishlist}
              />
            )}
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <a href="#map" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium underline">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold">{property.location}</span> — Show on map
              </a>
              {property.averageRating && property.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-white px-3 py-2 rounded-lg font-bold" style={{ backgroundColor: 'var(--red)' }}>
                    <span className="text-base">{property.averageRating.toFixed(1)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {property.averageRating >= 9 ? 'Superb' : 
                       property.averageRating >= 8 ? 'Very good' : 
                       property.averageRating >= 7 ? 'Good' : 'Pleasant'}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold">{property.reviewCount} reviews</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Gallery - booking.com style */}
        <div className="grid grid-cols-4 gap-2 mb-6 rounded-lg overflow-hidden" style={{ height: '450px' }}>
          {/* Main Image */}
          <div className="col-span-2 row-span-2 relative">
            {coverImage ? (
              <Image
                src={coverImage.imageUrl}
                alt={property.title}
                fill
                className="object-cover hover:brightness-95 transition cursor-pointer"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-lg">No image</span>
              </div>
            )}
          </div>
          
          {/* Secondary Images Grid */}
          {otherImages.map((img, idx) => (
            <div key={img.id} className="relative">
              <Image
                src={img.imageUrl}
                alt={`${property.title} - ${idx + 2}`}
                fill
                className="object-cover hover:brightness-95 transition cursor-pointer"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
          
          {/* Show all photos button */}
          {property.images.length > 5 && (
            <div className="absolute bottom-4 right-4">
              <button className="bg-white border border-gray-900 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 transition flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Show all {property.images.length} photos
              </button>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Key Information Box - Booking.com Style */}
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-sm font-semibold">Property</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{property.propertyType}</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-semibold">Guests</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">Up to {property.maxGuests}</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-sm font-semibold">Bedrooms</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{property.bedrooms}</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold">Bathrooms</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{property.bathrooms}</span>
                </div>
              </div>
            </div>

            {/* Most Popular Facilities - Booking.com Style */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Most popular facilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">\n                  {property.amenities.slice(0, 10).map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-3">
                      <div className="text-green-700 flex-shrink-0">
                        {getAmenityIcon(amenity.amenity.icon)}
                      </div>
                      <span className="text-gray-900 font-medium">{amenity.amenity.name}</span>
                    </div>
                  ))}
                </div>
                {property.amenities.length > 10 && (
                  <button className="mt-4 font-bold text-sm transition-colors hover:underline" style={{ color: 'var(--red)' }}>
                    Show all {property.amenities.length} facilities →
                  </button>
                )}
              </div>
            )}

            {/* Property Description */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                {property.description}
              </p>
            </div>

            {/* Room Details */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-900 font-semibold mb-1">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">
                    {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-900 font-semibold mb-1">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">
                    {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-gray-900 font-semibold mb-1">{property.beds}</div>
                  <div className="text-sm text-gray-600">
                    {property.beds === 1 ? 'Bed' : 'Beds'}
                  </div>
                </div>
                
                {property.areaSize && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-900 font-semibold mb-1">{property.areaSize}m²</div>
                    <div className="text-sm text-gray-600">Living space</div>
                  </div>
                )}
                
                {property.floor !== null && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-900 font-semibold mb-1">Floor {property.floor}</div>
                    <div className="text-sm text-gray-600">Level</div>
                  </div>
                )}
              </div>
            </div>

            {/* Check-in/Check-out */}
            {property.checkInTime && property.checkOutTime && (
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check-in & Check-out</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Check-in</div>
                      <div className="text-gray-700">From {property.checkInTime}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Check-out</div>
                      <div className="text-gray-700">Until {property.checkOutTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location on Map Section */}
            {property.latitude && property.longitude && (
              <div id="map" className="border border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Where you&apos;ll be</h2>
                <div className="mb-3">
                  <p className="text-gray-700 font-semibold">{property.address}</p>
                  <p className="text-gray-600">{property.city}, {property.district}</p>
                </div>
                <PropertyMap
                  latitude={Number(property.latitude)}
                  longitude={Number(property.longitude)}
                  title={property.title}
                  address={property.address}
                  city={property.city}
                  district={property.district}
                  distanceToCenter={property.distanceToCenter ? Number(property.distanceToCenter) : null}
                  nearestAirport={property.nearestAirport}
                  airportDistance={property.airportDistance ? Number(property.airportDistance) : null}
                />
              </div>
            )}
          </div>

          {/* Right Column - Property Info Card */}
          <div>
            <div className="sticky top-4">
              {/* Property Confidence Score */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="font-semibold text-gray-900 mb-3">Why choose this property?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-700">Verified by our team</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">24/7 customer support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-gray-700">Secure payment options</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Selection Section - Booking.com style */}
        {formattedRoomTypes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Availability</h2>
            
            <RoomSelection
              roomTypes={formattedRoomTypes}
              currency={property.currency}
              locale={locale}
              nights={nights}
              checkIn={defaultCheckIn}
              checkOut={defaultCheckOut}
              adults={adultsCount}
              children={childrenCount}
              propertyId={property.id}
              disabled={isSoldOut}
            />
          </div>
        )}

        {/* Fallback for properties without room types */}
        {formattedRoomTypes.length === 0 && (
          <div className="mt-12 bg-blue-50 border-2 rounded-lg p-6 shadow-sm" style={{ borderColor: isSoldOut ? '#e5e7eb' : 'var(--red)' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isSoldOut ? 'Sold out on these dates' : 'Book this property'}
                </h3>
                {!isSoldOut && (
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatCurrency(Number(property.basePrice), property.currency, locale)}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">per night</div>
                  </div>
                )}
                {isSoldOut && (
                  <p className="text-gray-600 font-medium italic">Please try different dates</p>
                )}
              </div>
              {!isSoldOut && (
                <Link
                  href={`/${locale}/properties/${id}/book${checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults || '2'}&children=${children || '0'}&rooms=${rooms || '1'}` : ''}`}
                  className="btn-primary text-base px-8 py-3 inline-block whitespace-nowrap font-bold"
                >
                  Reserve now
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
