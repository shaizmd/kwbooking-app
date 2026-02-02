"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";

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
  locale: string;
  index?: number;
}

const getAmenityIcon = (icon: string) => {
  const icons: { [key: string]: string } = {
    wifi: "📶",
    pool: "🏊",
    parking: "🅿️",
    ac: "❄️",
    kitchen: "🍳",
    elevator: "🛗",
    gym: "💪",
    spa: "🧖",
    beach: "🏖️",
    fireplace: "🔥",
  };
  return icons[icon] || "✓";
};

export function PropertyCard({ property, locale, index = 0 }: PropertyCardProps) {
  const coverImage = property.images[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link
        href={`/${locale}/properties/${property.id}`}
        className="block group"
      >
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative h-56 overflow-hidden">
            {coverImage ? (
              <Image
                src={coverImage.imageUrl}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div 
                style={{ background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.8), rgba(211, 47, 47, 0.5))' }} 
                className="w-full h-full flex items-center justify-center"
              >
                <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            )}
            
            {/* Badges */}
            {property.featured && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Featured
              </div>
            )}
            
            {property.instantBooking && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <span>⚡</span>
                <span>Instant Book</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-lg" 
                style={{ 
                  background: 'rgba(211, 47, 47, 0.1)', 
                  color: 'var(--red)' 
                }}
              >
                {property.propertyType}
              </span>
              
              {property.averageRating && property.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-bold text-sm">{property.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400 text-xs">({property.reviewCount})</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-red-600 transition-colors" 
              style={{ color: 'var(--text-dark)' }}
            >
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{property.location}</span>
            </div>

            {/* Property Details */}
            <div className="flex items-center gap-4 mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-1">
                <span>🛏️</span>
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🚿</span>
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {property.amenities.slice(0, 4).map((amenity) => (
                  <span 
                    key={amenity.amenity.id}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-100 flex items-center gap-1"
                    title={amenity.amenity.name}
                  >
                    <span>{getAmenityIcon(amenity.amenity.icon)}</span>
                    <span className="text-gray-600">{amenity.amenity.name}</span>
                  </span>
                ))}
                {property.amenities.length > 4 && (
                  <span className="text-xs text-gray-500">
                    +{property.amenities.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="price-text font-bold text-2xl">
                    {formatCurrency(
                      Number(property.basePrice),
                      property.currency,
                      locale
                    )}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    /night
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  For {property.baseGuests} {property.baseGuests === 1 ? 'guest' : 'guests'}
                  {property.maxGuests > property.baseGuests && ` • Max ${property.maxGuests}`}
                </p>
              </div>
              
              <button 
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all text-white"
                style={{ 
                  background: 'var(--red)',
                  boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)'
                }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
