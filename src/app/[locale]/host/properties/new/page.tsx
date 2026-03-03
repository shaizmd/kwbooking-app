"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [propertyType, setPropertyType] = useState<string>("APARTMENT");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    try {
      const baseGuests = Number(formData.get("baseGuests"));
      const maxGuests = Number(formData.get("maxGuests"));

      // Quick client-side validation for guest capacity before hitting the API
      if (maxGuests < baseGuests) {
        setFieldErrors({
          maxGuests: ["Max guests cannot be less than base guests"],
        });
        setError("Some fields have errors. Please review the highlighted inputs below.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          location: formData.get("location"),
          propertyType: formData.get("propertyType"),
          basePrice: Number(formData.get("basePrice")),
          baseGuests,
          maxGuests,
          extraGuestPrice: Number(formData.get("extraGuestPrice") || 0),
          bedrooms: Number(formData.get("bedrooms")),
          bathrooms: Number(formData.get("bathrooms")),
          beds: Number(formData.get("beds")),
          areaSize: formData.get("areaSize") ? Number(formData.get("areaSize")) : undefined,
          // Only send floor for apartments; for other property types
          // it should be ignored/disabled.
          floor:
            (formData.get("propertyType") === "APARTMENT" && formData.get("floor"))
              ? Number(formData.get("floor"))
              : undefined,
          checkInTime: formData.get("checkInTime"),
          checkOutTime: formData.get("checkOutTime"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the API sent field-level validation details (from Zod),
        // map them into a field -> messages structure so we can
        // highlight the exact inputs that are invalid.
        if (data?.details && Array.isArray(data.details)) {
          const nextFieldErrors: Record<string, string[]> = {};

          for (const issue of data.details as Array<{ path?: unknown[]; message?: string }>) {
            const path = Array.isArray(issue.path) ? issue.path : [];
            const field = typeof path[0] === "string" ? (path[0] as string) : undefined;
            const message = typeof issue.message === "string" ? issue.message : undefined;

            if (!field || !message) continue;

            if (!nextFieldErrors[field]) {
              nextFieldErrors[field] = [];
            }
            nextFieldErrors[field].push(message);
          }

          if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            setError("Some fields have errors. Please review the highlighted inputs below.");
            setLoading(false);
            return;
          }
        }

        throw new Error(data?.error || "Failed to create property");
      }

      // Redirect to room types management for the newly created property
      router.push(`/${locale}/host/properties/${data.id}/rooms`);
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add New Property</h1>
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Luxury Apartment in Salmiya"
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.title.join(" ")}</p>
              )}
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                id="propertyType"
                name="propertyType"
                required
                value={propertyType}
                onChange={(e) => {
                  setPropertyType(e.target.value);
                  // Clear any floor-related errors when switching away
                  // from apartment, since the field will be disabled.
                  if (e.target.value !== "APARTMENT" && fieldErrors.floor) {
                    const { floor, ...rest } = fieldErrors;
                    setFieldErrors(rest);
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.propertyType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio</option>
                <option value="HOTEL">Hotel Room</option>
                <option value="RESORT">Resort</option>
              </select>
              {fieldErrors.propertyType && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.propertyType.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe your property, amenities, and what makes it special..."
              />
              {fieldErrors.description && (
                <p
                  className="text-sm text-red-600 mt-1"
                  style={{ color: "var(--red)" }}
                >
                  {fieldErrors.description.join(" ")}
                </p>
              )}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                fieldErrors.location ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Salmiya, Kuwait City"
            />
            <p className="text-sm text-gray-600 mt-1">Enter city and area information</p>
            {fieldErrors.location && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.location.join(" ")}</p>
            )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.bedrooms ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.bedrooms && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.bedrooms.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.bathrooms ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.bathrooms && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.bathrooms.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.beds ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.beds && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.beds.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.areaSize ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Optional"
              />
              {fieldErrors.areaSize && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.areaSize.join(" ")}</p>
              )}
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
                disabled={propertyType !== "APARTMENT"}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.floor ? "border-red-500" : "border-gray-300"
                } ${propertyType !== "APARTMENT" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder={propertyType === "APARTMENT" ? "Optional" : "Only applicable for apartments"}
              />
              <p className="text-xs text-gray-600 mt-1">
                {propertyType === "APARTMENT"
                  ? "Only needed for apartments"
                  : "Floor number applies only to apartments and is disabled for this property type"}
              </p>
              {fieldErrors.floor && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.floor.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.baseGuests ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-600 mt-1">Included in base price</p>
              {fieldErrors.baseGuests && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.baseGuests.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.maxGuests ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-600 mt-1">Maximum capacity</p>
              {fieldErrors.maxGuests && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.maxGuests.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.basePrice ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.000"
              />
              <p className="text-xs text-gray-600 mt-1">For base guest count</p>
              {fieldErrors.basePrice && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.basePrice.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.extraGuestPrice ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.000"
              />
              <p className="text-xs text-gray-600 mt-1">Per additional guest</p>
              {fieldErrors.extraGuestPrice && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.extraGuestPrice.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.checkInTime ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.checkInTime && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.checkInTime.join(" ")}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--red)] focus:border-transparent transition-shadow ${
                  fieldErrors.checkOutTime ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.checkOutTime && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.checkOutTime.join(" ")}</p>
              )}
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
