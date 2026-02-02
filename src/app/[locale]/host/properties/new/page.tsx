"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          location: formData.get("location"),
          propertyType: formData.get("propertyType"),
          basePrice: Number(formData.get("basePrice")),
          baseGuests: Number(formData.get("baseGuests")),
          maxGuests: Number(formData.get("maxGuests")),
          extraGuestPrice: Number(formData.get("extraGuestPrice") || 0),
          bedrooms: Number(formData.get("bedrooms")),
          bathrooms: Number(formData.get("bathrooms")),
          beds: Number(formData.get("beds")),
          areaSize: formData.get("areaSize") ? Number(formData.get("areaSize")) : undefined,
          floor: formData.get("floor") ? Number(formData.get("floor")) : undefined,
          checkInTime: formData.get("checkInTime"),
          checkOutTime: formData.get("checkOutTime"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create property");
      }

      const data = await response.json();
      router.push(`/host/properties/${data.id}`);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/host/properties"
          className="inline-flex items-center text-gray-700 hover-red font-medium mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Property</h1>
        <p className="text-gray-600">
          Fill in the details below to list your property
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
                placeholder="e.g., Luxury Apartment in Salmiya"
              />
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                id="propertyType"
                name="propertyType"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio</option>
                <option value="HOTEL">Hotel Room</option>
                <option value="RESORT">Resort</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
                placeholder="Describe your property, amenities, and what makes it special..."
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location/Area *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              placeholder="e.g., Salmiya, Kuwait City"
            />
            <p className="text-sm text-gray-600 mt-1">Enter city and area information</p>
          </div>
        </div>

        {/* Property Details */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms *
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                required
                min="1"
                defaultValue="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms *
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                required
                min="1"
                defaultValue="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-1">
                Beds *
              </label>
              <input
                type="number"
                id="beds"
                name="beds"
                required
                min="1"
                defaultValue="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="areaSize" className="block text-sm font-medium text-gray-700 mb-1">
                Area Size (m²)
              </label>
              <input
                type="number"
                id="areaSize"
                name="areaSize"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor Number
              </label>
              <input
                type="number"
                id="floor"
                name="floor"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
                placeholder="Optional"
              />
              <p className="text-xs text-gray-600 mt-1">For apartments</p>
            </div>
          </div>
        </div>

        {/* Guest Capacity */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Capacity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="baseGuests" className="block text-sm font-medium text-gray-700 mb-1">
                Base Guests *
              </label>
              <input
                type="number"
                id="baseGuests"
                name="baseGuests"
                required
                min="1"
                defaultValue="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              />
              <p className="text-xs text-gray-600 mt-1">Included in base price</p>
            </div>

            <div>
              <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">
                Max Guests *
              </label>
              <input
                type="number"
                id="maxGuests"
                name="maxGuests"
                required
                min="1"
                defaultValue="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              />
              <p className="text-xs text-gray-600 mt-1">Maximum capacity</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Base Price per Night (KWD) *
              </label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                required
                min="0"
                step="0.001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
                placeholder="0.000"
              />
              <p className="text-xs text-gray-600 mt-1">For base guest count</p>
            </div>

            <div>
              <label htmlFor="extraGuestPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Extra Guest Price (KWD)
              </label>
              <input
                type="number"
                id="extraGuestPrice"
                name="extraGuestPrice"
                min="0"
                step="0.001"
                defaultValue="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
                placeholder="0.000"
              />
              <p className="text-xs text-gray-600 mt-1">Per additional guest</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Time
              </label>
              <input
                type="time"
                id="checkInTime"
                name="checkInTime"
                defaultValue="14:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Time
              </label>
              <input
                type="time"
                id="checkOutTime"
                name="checkOutTime"
                defaultValue="11:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Property"}
          </button>
          <Link
            href="/host/properties"
            className="flex-1 bg-white hover-bg-white-light text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold transition text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
