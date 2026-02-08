'use client';

import { useState } from 'react';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  distanceToCenter?: number | null;
  nearestAirport?: string | null;
  airportDistance?: number | null;
}

export default function PropertyMap({
  latitude,
  longitude,
  title,
  address,
  city,
  district,
  distanceToCenter,
  nearestAirport,
  airportDistance,
}: PropertyMapProps) {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Fallback to OpenStreetMap if Google Maps API key is not available
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02},${latitude - 0.02},${longitude + 0.02},${latitude + 0.02}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="space-y-4">
      {/* Location Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Where you&apos;ll be</h2>
        <p className="text-gray-600">
          {address && <span>{address}, </span>}
          {district && <span>{district}, </span>}
          {city && <span>{city}</span>}
        </p>
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <iframe
          src={osmUrl}
          width="100%"
          height={isMapExpanded ? '600' : '400'}
          className="w-full"
          style={{ border: 0 }}
          loading="lazy"
          title={`Map showing location of ${title}`}
        />
        
        {/* Show on Map Button Overlay */}
        <button
          onClick={() => setIsMapExpanded(!isMapExpanded)}
          className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-gray-800 font-medium px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {isMapExpanded ? 'Show less' : 'Show on map'}
        </button>
      </div>

      {/* Location Details */}
      <div className="grid md:grid-cols-2 gap-4 pt-2">
        {distanceToCenter !== null && distanceToCenter !== undefined && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">City center</h3>
              <p className="text-sm text-gray-600">{distanceToCenter.toFixed(1)} km</p>
            </div>
          </div>
        )}

        {nearestAirport && airportDistance !== null && airportDistance !== undefined && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{nearestAirport}</h3>
              <p className="text-sm text-gray-600">{airportDistance.toFixed(1)} km</p>
            </div>
          </div>
        )}
      </div>

      {/* Exact Location Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Exact location provided after booking</p>
          <p className="text-blue-700">
            For your privacy and security, we&apos;ll share the exact address with confirmed guests only.
          </p>
        </div>
      </div>

      {/* Open in Google Maps Link */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-medium transition-colors" style={{ color: 'var(--red)' }}
      >
        Open in Google Maps
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}
