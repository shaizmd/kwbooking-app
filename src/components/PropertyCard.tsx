"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";
import WishlistButton from "./WishlistButton";

interface PropertyImage {
  id: string;
  imageUrl: string;
  order: number;
}

interface PropertyAmenity {
  amenity: {
    id: string;
    name: string;
    icon: string;
  };
}

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    titleAr?: string | null;
    description: string;
    location: string;
    basePrice: number;
    currency: string;
    baseGuests: number;
    maxGuests: number;
    extraGuestPrice?: number | null;
    bedrooms: number;
    bathrooms: number;
    beds: number;
    areaSize?: number | null;
    propertyType: string;
    averageRating?: number | null;
    reviewCount: number;
    featured: boolean;
    instantBooking: boolean;
    images: PropertyImage[];
    amenities?: PropertyAmenity[];
  };
  pricing?: {
    nights: number;
    totalPrice: number;
    currency: string;
    extraGuests: number;
    requiredRooms: number;
    roomNote?: string | null;
  };
  isSoldOut?: boolean;
  locale: string;
  index?: number;
  userId?: string | null;
  isInWishlist?: boolean;
}

export function PropertyCard({ property, pricing, isSoldOut, locale, index = 0, userId, isInWishlist = false }: PropertyCardProps) {
  const coverImage = property.images[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Link
        href={`/${locale}/properties/${property.id}`}
        className="block group"
      >
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200">
          <div className="flex flex-col md:flex-row">
            {/* Image Container - Left Side */}
            <div className="relative md:w-80 h-64 md:h-auto shrink-0 overflow-hidden">
              {userId && (
                <WishlistButton
                  propertyId={property.id}
                  locale={locale}
                  isInWishlist={isInWishlist}
                />
              )}
              {coverImage ? (
                <Image
                  src={coverImage.imageUrl}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 flex-1">
                {/* Header with type and rating */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white bg-blue-800 px-2 py-1 rounded">
                      {property.propertyType}
                    </span>
                    {property.featured && (
                      <span className="text-xs font-semibold text-white bg-yellow-500 px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-1 group-hover:underline line-clamp-2" style={{ color: 'var(--text-dark)' }}>
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{property.location}</span>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-3 mb-3 text-sm text-gray-700">
                  <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{property.baseGuests} guests</span>
                </div>

                {pricing?.roomNote && (
                  <div className="text-xs text-red-600 mb-3">
                    {pricing.roomNote}
                  </div>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600 mb-3">
                    {property.amenities.slice(0, 5).map((amenity, idx) => (
                      <span key={amenity.amenity.id}>
                        {amenity.amenity.name}{idx < Math.min(4, property.amenities!.length - 1) ? ' •' : ''}
                      </span>
                    ))}
                    {property.amenities.length > 5 && (
                      <span>+{property.amenities.length - 5} more</span>
                    )}
                  </div>
                )}

                {/* Description preview */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {property.description}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  {property.instantBooking && (
                    <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                      Instant booking
                    </span>
                  )}
                </div>
              </div>

              {/* Price Section - Bottom aligned */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex-1">
                  {property.averageRating && property.averageRating > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-white px-2 py-1 rounded-t-lg rounded-br-lg text-xs font-medium" style={{ backgroundColor: 'var(--red-dark)' }}>
                        {property.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">
                          {property.averageRating >= 9 ? 'Superb' : 
                           property.averageRating >= 8 ? 'Very good' : 
                           property.averageRating >= 7 ? 'Good' : 'Pleasant'}
                        </span>
                        <span className="text-gray-600 ml-1">• {property.reviewCount} reviews</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  {isSoldOut ? (
                    <div className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg border border-gray-300">
                      Sold out on your dates!
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600 mb-1">
                        {pricing ? `${pricing.nights} night${pricing.nights !== 1 ? "s" : ""}` : "1 night"}
                      </div>
                      <div className="text-xl font-semibold text-gray-900">
                        {pricing
                          ? formatCurrency(pricing.totalPrice, pricing.currency, locale)
                          : formatCurrency(Number(property.basePrice), property.currency, locale)}
                      </div>
                      {pricing && pricing.extraGuests > 0 ? (
                        <div className="text-xs text-gray-500 mt-1">
                          Includes {pricing.extraGuests} extra guest{pricing.extraGuests !== 1 ? "s" : ""}
                        </div>
                      ) : (
                        property.extraGuestPrice && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{formatCurrency(Number(property.extraGuestPrice), property.currency, locale)}/extra guest
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
