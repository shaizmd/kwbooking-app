"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RoomPackage {
  name: string;
  originalPrice?: number;
  finalPrice: number;
  discountPercent?: number;
  isLimitedTime: boolean;
  dealLabel?: string;
  freeCancellation: boolean;
  cancellationDeadline?: number;
  cancellationDeadlineText?: string;
  isRefundable: boolean;
  prepaymentRequired: boolean;
  noCreditCard: boolean;
  benefits: string[];
}

interface RoomTypeForm {
  name: string;
  description: string;
  bedType: string;
  bedCount: number;
  maxGuests: number;
  roomSize?: number;
  basePrice: number;
  features: string[];
  packages: RoomPackage[];
}

export default function ManageRoomTypesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [locale, setLocale] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingRooms, setExistingRooms] = useState<any[]>([]);

  const [formData, setFormData] = useState<RoomTypeForm>({
    name: "",
    description: "",
    bedType: "1 double bed",
    bedCount: 1,
    maxGuests: 2,
    roomSize: undefined,
    basePrice: 0,
    features: [],
    packages: [
      {
        name: "Standard Rate",
        finalPrice: 0,
        freeCancellation: true,
        cancellationDeadline: 24,
        cancellationDeadlineText: "before 24 hours of check-in",
        isRefundable: true,
        prepaymentRequired: false,
        noCreditCard: false,
        isLimitedTime: false,
        benefits: [],
      },
    ],
  });

  const [newFeature, setNewFeature] = useState("");
  const [newBenefit, setNewBenefit] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    params.then((p) => {
      setPropertyId(p.id);
      setLocale(p.locale);
      setMounted(true);
      loadExistingRooms(p.id);
    });
  }, [params]);

  const loadExistingRooms = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}/room-types`);
      if (response.ok) {
        const data = await response.json();
        setExistingRooms(data.roomTypes || []);
      }
    } catch (err) {
      console.error("Error loading existing rooms:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/properties/${propertyId}/room-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room type");
      }

      setSuccess("Room type created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        bedType: "1 double bed",
        bedCount: 1,
        maxGuests: 2,
        roomSize: undefined,
        basePrice: 0,
        features: [],
        packages: [
          {
            name: "Standard Rate",
            finalPrice: 0,
            freeCancellation: true,
            cancellationDeadline: 24,
            cancellationDeadlineText: "before 24 hours of check-in",
            isRefundable: true,
            prepaymentRequired: false,
            noCreditCard: false,
            isLimitedTime: false,
            benefits: [],
          },
        ],
      });

      // Reload existing rooms
      await loadExistingRooms(propertyId);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const addPackage = () => {
    setFormData({
      ...formData,
      packages: [
        ...formData.packages,
        {
          name: "",
          finalPrice: formData.basePrice,
          freeCancellation: false,
          isRefundable: false,
          prepaymentRequired: false,
          noCreditCard: false,
          isLimitedTime: false,
          benefits: [],
        },
      ],
    });
  };

  const removePackage = (index: number) => {
    if (formData.packages.length > 1) {
      setFormData({
        ...formData,
        packages: formData.packages.filter((_, i) => i !== index),
      });
      // Remap newBenefit indices so benefit text stays with the correct package
      const remapped: { [key: number]: string } = {};
      Object.entries(newBenefit).forEach(([key, value]) => {
        const k = parseInt(key);
        if (k < index) remapped[k] = value;
        else if (k > index) remapped[k - 1] = value;
        // k === index is discarded along with the removed package
      });
      setNewBenefit(remapped);
    }
  };

  const updatePackage = (index: number, field: string, value: any) => {
    const newPackages = [...formData.packages];
    (newPackages[index] as any)[field] = value;
    setFormData({ ...formData, packages: newPackages });
  };

  const addBenefitToPackage = (packageIndex: number) => {
    const benefit = newBenefit[packageIndex];
    if (benefit?.trim()) {
      const newPackages = [...formData.packages];
      newPackages[packageIndex].benefits.push(benefit.trim());
      setFormData({ ...formData, packages: newPackages });
      setNewBenefit({ ...newBenefit, [packageIndex]: "" });
    }
  };

  const removeBenefitFromPackage = (packageIndex: number, benefitIndex: number) => {
    const newPackages = [...formData.packages];
    newPackages[packageIndex].benefits = newPackages[packageIndex].benefits.filter(
      (_, i) => i !== benefitIndex
    );
    setFormData({ ...formData, packages: newPackages });
  };

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-6 bg-gray-200 rounded w-72 mb-8" />
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/host/properties/${propertyId}`}
          className="inline-flex items-center text-gray-700 hover:text-red-700 font-medium mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Property
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Room Types</h1>
        <p className="text-gray-600">
          Add different room configurations for your property. Each room type can have multiple pricing packages.
        </p>
      </div>

      {/* Existing Room Types */}
      {existingRooms.length > 0 && (
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Room Types</h2>
          <div className="space-y-4">
            {existingRooms.map((room: any) => (
              <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-600">{room.bedType} • Max {room.maxGuests} guests</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      Base Price: {room.basePrice} KWD
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {room.packages?.length || 0} packages
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add New Room Type Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Room Type</h2>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="e.g., Deluxe Room, Studio Apartment"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Type *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={formData.bedType}
                  onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                >
                  <option value="1 single bed">1 single bed</option>
                  <option value="2 single beds">2 single beds</option>
                  <option value="1 double bed">1 double bed</option>
                  <option value="1 queen bed">1 queen bed</option>
                  <option value="1 king bed">1 king bed</option>
                  <option value="1 sofa bed">1 sofa bed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Describe this room type..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Count *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={formData.bedCount}
                  onChange={(e) => setFormData({ ...formData, bedCount: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Guests *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Size (m²)
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={formData.roomSize || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roomSize: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (KWD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  value={formData.basePrice || ""}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    // Auto-sync first package's finalPrice if it still matches the old base price
                    const updatedPackages = formData.packages.map((pkg, i) =>
                      i === 0 && pkg.finalPrice === formData.basePrice
                        ? { ...pkg, finalPrice: price }
                        : pkg
                    );
                    setFormData({ ...formData, basePrice: price, packages: updatedPackages });
                  }}
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Features
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="e.g., Air conditioning, Free WiFi"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Packages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing Packages</h3>
            <button
              type="button"
              onClick={addPackage}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              + Add Package
            </button>
          </div>

          <div className="space-y-6">
            {formData.packages.map((pkg, packageIndex) => (
              <div key={packageIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Package {packageIndex + 1}</h4>
                  {formData.packages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePackage(packageIndex)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove Package
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="e.g., Best Deal, Non-refundable"
                      value={pkg.name}
                      onChange={(e) => updatePackage(packageIndex, "name", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Price (KWD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      value={pkg.finalPrice || ""}
                      onChange={(e) =>
                        updatePackage(packageIndex, "finalPrice", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (KWD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      value={pkg.originalPrice || ""}
                      onChange={(e) =>
                        updatePackage(
                          packageIndex,
                          "originalPrice",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      value={pkg.discountPercent || ""}
                      onChange={(e) =>
                        updatePackage(
                          packageIndex,
                          "discountPercent",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>

                {/* Package Options */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pkg.freeCancellation}
                      onChange={(e) =>
                        updatePackage(packageIndex, "freeCancellation", e.target.checked)
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Free Cancellation</span>
                  </label>

                  {pkg.freeCancellation && (
                    <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Hours before check-in"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        value={pkg.cancellationDeadline || ""}
                        onChange={(e) =>
                          updatePackage(
                            packageIndex,
                            "cancellationDeadline",
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="e.g., before 24 hours"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        value={pkg.cancellationDeadlineText || ""}
                        onChange={(e) =>
                          updatePackage(packageIndex, "cancellationDeadlineText", e.target.value)
                        }
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pkg.isRefundable}
                      onChange={(e) => updatePackage(packageIndex, "isRefundable", e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Refundable</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pkg.prepaymentRequired}
                      onChange={(e) =>
                        updatePackage(packageIndex, "prepaymentRequired", e.target.checked)
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Prepayment Required</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pkg.noCreditCard}
                      onChange={(e) =>
                        updatePackage(packageIndex, "noCreditCard", e.target.checked)
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">No Credit Card Needed</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pkg.isLimitedTime}
                      onChange={(e) =>
                        updatePackage(packageIndex, "isLimitedTime", e.target.checked)
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Limited Time Deal</span>
                  </label>

                  {pkg.isLimitedTime && (
                    <div className="ml-6">
                      <input
                        type="text"
                        placeholder="Deal label (e.g., Early Bird)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        value={pkg.dealLabel || ""}
                        onChange={(e) => updatePackage(packageIndex, "dealLabel", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Package Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Benefits
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="e.g., Free breakfast, 10% off food"
                      value={newBenefit[packageIndex] || ""}
                      onChange={(e) => setNewBenefit({ ...newBenefit, [packageIndex]: e.target.value })}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addBenefitToPackage(packageIndex))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => addBenefitToPackage(packageIndex)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pkg.benefits.map((benefit, benefitIndex) => (
                      <span
                        key={benefitIndex}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefitFromPackage(packageIndex, benefitIndex)}
                          className="hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? "Creating..." : "Create Room Type"}
          </button>
          <Link
            href={`/${locale}/host/properties/${propertyId}`}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Done
          </Link>
        </div>
      </form>
    </div>
  );
}
