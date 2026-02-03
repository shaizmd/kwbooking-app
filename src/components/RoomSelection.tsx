"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";

interface RoomPackage {
  id: string;
  name: string;
  originalPrice: number | null;
  finalPrice: number;
  discountPercent: number | null;
  isLimitedTime: boolean;
  dealLabel: string | null;
  freeCancellation: boolean;
  cancellationDeadlineText: string | null;
  isRefundable: boolean;
  prepaymentRequired: boolean;
  noCreditCard: boolean;
  benefits: string[];
}

interface RoomType {
  id: string;
  name: string;
  bedType: string;
  maxGuests: number;
  roomSize: number | null;
  features: string[];
  packages: RoomPackage[];
}

interface RoomSelectionProps {
  roomTypes: RoomType[];
  currency: string;
  locale: string;
  nights: number;
  checkIn: string;
  checkOut: string;
  propertyId: string;
}

export default function RoomSelection({
  roomTypes,
  currency,
  locale,
  nights,
  checkIn,
  checkOut,
  propertyId,
}: RoomSelectionProps) {
  const [selectedRooms, setSelectedRooms] = useState<{
    [roomTypeId: string]: { packageId: string; quantity: number };
  }>({});

  const handleRoomSelection = (
    roomTypeId: string,
    packageId: string,
    quantity: number
  ) => {
    setSelectedRooms((prev) => ({
      ...prev,
      [roomTypeId]: { packageId, quantity },
    }));
  };

  const getGuestIcon = (count: number) => {
    const icons = [];
    for (let i = 0; i < count; i++) {
      icons.push(
        <svg
          key={i}
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return icons;
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(selectedRooms).forEach(([roomTypeId, selection]) => {
      const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
      const pkg = roomType?.packages.find((p) => p.id === selection.packageId);
      if (pkg) {
        total += pkg.finalPrice * selection.quantity;
      }
    });
    return total;
  };

  const hasSelectedRooms = Object.values(selectedRooms).some(
    (s) => s.quantity > 0
  );

  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="text-white rounded-t-lg overflow-hidden" style={{ backgroundColor: 'var(--red)' }}>
        <div className="grid grid-cols-12 gap-4 px-6 py-4 font-semibold">
          <div className="col-span-3">Room type</div>
          <div className="col-span-2">Number of guests</div>
          <div className="col-span-2">
            Price for {nights} {nights === 1 ? "night" : "nights"}
          </div>
          <div className="col-span-3">Your choice</div>
          <div className="col-span-2">Select rooms</div>
        </div>
      </div>

      {/* Room Types */}
      <div className="space-y-8">
        {roomTypes.map((roomType, roomIdx) => (
          <div
            key={roomType.id}
            className={`${
              roomIdx > 0 ? "border-t-2 border-gray-200 pt-8" : ""
            }`}
          >
            {/* Room Type Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                {roomType.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{roomType.bedType}</span>
                {roomType.roomSize && (
                  <span>{roomType.roomSize} m²</span>
                )}
              </div>
              
              {/* Room Features */}
              <div className="mt-3 flex flex-wrap gap-2">
                {roomType.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md text-xs text-gray-700"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Package Options */}
            <div className="space-y-4">
              {roomType.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="grid grid-cols-12 gap-4 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Room Type Column (Empty for packages) */}
                  <div className="col-span-3"></div>

                  {/* Guests Column */}
                  <div className="col-span-2 flex items-start pt-2">
                    <div className="flex gap-1">
                      {getGuestIcon(roomType.maxGuests)}
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className="col-span-2">
                    <div className="space-y-1">
                      {pkg.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatCurrency(pkg.originalPrice, currency, locale)}
                        </div>
                      )}
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(pkg.finalPrice, currency, locale)}
                      </div>
                      <div className="text-xs text-gray-500">
                        +{formatCurrency(pkg.finalPrice * 0.05, currency, locale)} taxes
                        and charges
                      </div>
                      {pkg.discountPercent && (
                        <div className="inline-block px-2 py-1 bg-green-700 text-white text-xs font-semibold rounded">
                          {pkg.discountPercent}% off
                        </div>
                      )}
                      {pkg.isLimitedTime && pkg.dealLabel && (
                        <div className="inline-block px-2 py-1 bg-green-700 text-white text-xs font-semibold rounded mt-1">
                          {pkg.dealLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Benefits Column */}
                  <div className="col-span-3">
                    <div className="space-y-2">
                      {pkg.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm text-green-700 font-medium">
                            {benefit}
                          </span>
                        </div>
                      ))}
                      {pkg.freeCancellation && (
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm text-green-700">
                            <strong>Free cancellation</strong>{" "}
                            {pkg.cancellationDeadlineText && (
                              <span className="font-normal">
                                {pkg.cancellationDeadlineText}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {pkg.prepaymentRequired && (
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-gray-500 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            Pay the property before arrival
                          </span>
                        </div>
                      )}
                      {pkg.noCreditCard && (
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                          <span className="text-sm text-green-700 font-medium">
                            No credit card needed
                          </span>
                        </div>
                      )}
                      {!pkg.isRefundable && (
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm text-red-700 font-medium">
                            Non-refundable
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selection Column */}
                  <div className="col-span-2">
                    <div className="space-y-3">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
                        value={
                          selectedRooms[roomType.id]?.packageId === pkg.id
                            ? selectedRooms[roomType.id].quantity
                            : 0
                        }
                        onChange={(e) =>
                          handleRoomSelection(
                            roomType.id,
                            pkg.id,
                            parseInt(e.target.value)
                          )
                        }
                      >
                        <option value="0">0</option>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>

                      {selectedRooms[roomType.id]?.packageId === pkg.id &&
                        selectedRooms[roomType.id].quantity > 0 && (
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">
                              {selectedRooms[roomType.id].quantity}{" "}
                              {selectedRooms[roomType.id].quantity === 1
                                ? "room"
                                : "rooms"}{" "}
                              for
                            </div>
                            <div className="text-xl font-semibold text-gray-900 mt-1">
                              {formatCurrency(
                                pkg.finalPrice *
                                  selectedRooms[roomType.id].quantity,
                                currency,
                                locale
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              +
                              {formatCurrency(
                                pkg.finalPrice *
                                  selectedRooms[roomType.id].quantity *
                                  0.05,
                                currency,
                                locale
                              )}{" "}
                              taxes and charges
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Summary (Sticky) */}
      {hasSelectedRooms && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total price</div>
              <div className="text-2xl font-semibold text-gray-900">
                {formatCurrency(calculateTotal(), currency, locale)}
              </div>
              <div className="text-xs text-gray-500">
                +{formatCurrency(calculateTotal() * 0.05, currency, locale)} taxes and
                charges
              </div>
            </div>
            <button
              onClick={() => {
                // Build booking URL with selected rooms
                const params = new URLSearchParams();
                params.set("checkIn", checkIn);
                params.set("checkOut", checkOut);
                Object.entries(selectedRooms).forEach(
                  ([roomTypeId, selection]) => {
                    if (selection.quantity > 0) {
                      params.append("roomTypeId", roomTypeId);
                      params.append("packageId", selection.packageId);
                      params.append("quantity", selection.quantity.toString());
                    }
                  }
                );
                window.location.href = `/properties/${propertyId}/book?${params.toString()}`;
              }}
              className="btn-primary text-lg px-8 py-4"
            >
              I&apos;ll reserve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
