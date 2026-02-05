import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { createBooking } from "./actions";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import Image from "next/image";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomTypeId?: string | string[];
    packageId?: string | string[];
    quantity?: string | string[];
  }>;
}) {
  const { locale, id } = await params;
  const searchParamsResolved = await searchParams;

  // Check if user is logged in and is a customer
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (!token) {
    redirect(`/${locale}/login?redirect=/properties/${id}/book`);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    redirect(`/${locale}/login?redirect=/properties/${id}/book`);
  }

  if (payload.role !== "CUSTOMER") {
    redirect(`/${locale}/properties/${id}`);
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const property = await prisma.property.findFirst({
    where: {
      id,
      status: "ACTIVE",
    },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      host: {
        select: {
          email: true,
          fullName: true,
        },
      },
      roomTypes: {
        where: { isActive: true },
        include: {
          packages: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const coverImage = property.images[0];

  // Parse room selections from URL
  const roomTypeIds = Array.isArray(searchParamsResolved.roomTypeId)
    ? searchParamsResolved.roomTypeId
    : searchParamsResolved.roomTypeId
    ? [searchParamsResolved.roomTypeId]
    : [];
  const packageIds = Array.isArray(searchParamsResolved.packageId)
    ? searchParamsResolved.packageId
    : searchParamsResolved.packageId
    ? [searchParamsResolved.packageId]
    : [];
  const quantities = Array.isArray(searchParamsResolved.quantity)
    ? searchParamsResolved.quantity.map(Number)
    : searchParamsResolved.quantity
    ? [Number(searchParamsResolved.quantity)]
    : [];

  // Calculate booking details
  const checkIn = searchParamsResolved.checkIn || "";
  const checkOut = searchParamsResolved.checkOut || "";
  const guests = Number(searchParamsResolved.guests) || property.baseGuests;

  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const nights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 1;

  // Calculate total price from room selections
  let subtotal = 0;
  const selectedRooms: Array<{
    roomType: any;
    package: any;
    quantity: number;
    price: number;
  }> = [];

  roomTypeIds.forEach((roomTypeId, index) => {
    const roomType = property.roomTypes.find((rt) => rt.id === roomTypeId);
    const pkg = roomType?.packages.find((p) => p.id === packageIds[index]);
    const quantity = quantities[index] || 1;

    if (roomType && pkg) {
      const price = Number(pkg.finalPrice) * nights * quantity;
      subtotal += price;
      selectedRooms.push({ roomType, package: pkg, quantity, price });
    }
  });

  // Fallback to base price if no rooms selected
  if (selectedRooms.length === 0) {
    subtotal = Number(property.basePrice) * nights;
  }

  const taxRate = 0.05; // 5% tax
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  async function handleBooking(formData: FormData) {
    "use server";

    await createBooking({
      propertyId: id,
      checkIn: formData.get("checkIn") as string,
      checkOut: formData.get("checkOut") as string,
      guests: Number(formData.get("guests")),
      guestFullName: formData.get("fullName") as string,
      guestEmail: formData.get("email") as string,
      guestPhone: (formData.get("phone") as string) || undefined,
      arrivalTime: (formData.get("arrivalTime") as string) || undefined,
      specialRequests: (formData.get("specialRequests") as string) || undefined,
      locale,
    });
  }

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/${locale}/properties/${id}`}
            className="inline-flex items-center font-medium transition-colors" style={{ color: 'var(--red)' }}
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to property
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Enter your details
          </h1>
          <p className="text-gray-600">
            We'll use this information to send your confirmation and updates about your booking
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form action={handleBooking}>
              {/* Guest Details */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Enter your details
                </h2>

                <div className="space-y-4">
                  {/* Hidden fields */}
                  <input type="hidden" name="checkIn" value={checkIn} />
                  <input type="hidden" name="checkOut" value={checkOut} />
                  <input type="hidden" name="guests" value={guests} />
                  
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      defaultValue={user.fullName || ""}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your name as it appears on your ID
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      defaultValue={user.email}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Confirmation email goes to this address
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      defaultValue={user.phone || ""}
                      placeholder="+965 XXXX XXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Needed by the property to validate your booking
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrival Time */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  What time will you arrive?
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {property.checkInTime
                    ? `Check-in is from ${property.checkInTime}`
                    : "Please select your approximate arrival time"}
                </p>

                <div>
                  <label
                    htmlFor="arrivalTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Arrival time
                  </label>
                  <select
                    id="arrivalTime"
                    name="arrivalTime"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
                  >
                    <option value="">Select time (optional)</option>
                    <option value="00:00 - 01:00">00:00 - 01:00</option>
                    <option value="01:00 - 02:00">01:00 - 02:00</option>
                    <option value="02:00 - 03:00">02:00 - 03:00</option>
                    <option value="03:00 - 04:00">03:00 - 04:00</option>
                    <option value="04:00 - 05:00">04:00 - 05:00</option>
                    <option value="05:00 - 06:00">05:00 - 06:00</option>
                    <option value="06:00 - 07:00">06:00 - 07:00</option>
                    <option value="07:00 - 08:00">07:00 - 08:00</option>
                    <option value="08:00 - 09:00">08:00 - 09:00</option>
                    <option value="09:00 - 10:00">09:00 - 10:00</option>
                    <option value="10:00 - 11:00">10:00 - 11:00</option>
                    <option value="11:00 - 12:00">11:00 - 12:00</option>
                    <option value="12:00 - 13:00">12:00 - 13:00</option>
                    <option value="13:00 - 14:00">13:00 - 14:00</option>
                    <option value="14:00 - 15:00" defaultValue="14:00 - 15:00">
                      14:00 - 15:00
                    </option>
                    <option value="15:00 - 16:00">15:00 - 16:00</option>
                    <option value="16:00 - 17:00">16:00 - 17:00</option>
                    <option value="17:00 - 18:00">17:00 - 18:00</option>
                    <option value="18:00 - 19:00">18:00 - 19:00</option>
                    <option value="19:00 - 20:00">19:00 - 20:00</option>
                    <option value="20:00 - 21:00">20:00 - 21:00</option>
                    <option value="21:00 - 22:00">21:00 - 22:00</option>
                    <option value="22:00 - 23:00">22:00 - 23:00</option>
                    <option value="23:00 - 00:00">23:00 - 00:00</option>
                    <option value="not-sure">I don&apos;t know yet</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Special requests
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Special requests can&apos;t be guaranteed, but the property will do
                  its best to meet your needs. You can always make a special
                  request after your booking is complete.
                </p>

                <div>
                  <label
                    htmlFor="specialRequests"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Please write your requests (optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    rows={4}
                    placeholder="E.g., quiet room, high floor, early check-in..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none" style={{ '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    required
                    className="mt-1 w-4 h-4 border-gray-300 rounded" style={{ color: 'var(--red)', '--tw-ring-color': 'var(--red)' } as React.CSSProperties}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link href="/terms" className="hover:underline" style={{ color: 'var(--red)' }}>
                      terms and conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="hover:underline" style={{ color: 'var(--red)' }}>
                      privacy policy
                    </Link>
                    . By completing this booking, I understand that the host will
                    be sharing my details with me to finalize arrangements.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              {!checkIn || !checkOut ? (
                <div className="text-sm text-red-600">
                  Please select check-in and check-out dates before confirming your booking.
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!checkIn || !checkOut}
                className={`w-full text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg ${!checkIn || !checkOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: 'var(--red)' }}
                title={!checkIn || !checkOut ? 'Select dates first' : 'Confirm Booking'}
              >
                Confirm Booking
              </button>
            </form>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="bg-white rounded-lg border border-gray-300 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Your booking details
              </h3>

              {/* Property Image */}
              {coverImage && (
                <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={coverImage.imageUrl}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
              )}

              {/* Property Name */}
              <h4 className="font-bold text-gray-900 mb-2">{property.title}</h4>
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                {property.location}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {/* Dates */}
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Check-in
                  </div>
                  <div className="text-sm text-gray-700">
                    {checkInDate
                      ? checkInDate.toLocaleDateString(locale, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not selected"}
                  </div>
                  {property.checkInTime && (
                    <div className="text-xs text-gray-500">
                      From {property.checkInTime}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Check-out
                  </div>
                  <div className="text-sm text-gray-700">
                    {checkOutDate
                      ? checkOutDate.toLocaleDateString(locale, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not selected"}
                  </div>
                  {property.checkOutTime && (
                    <div className="text-xs text-gray-500">
                      Until {property.checkOutTime}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Total length of stay
                  </div>
                  <div className="text-sm text-gray-700">
                    {nights} {nights === 1 ? "night" : "nights"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Number of guests
                  </div>
                  <div className="text-sm text-gray-700">{guests} guests</div>
                </div>

                {/* Selected Rooms */}
                {selectedRooms.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      Your selection
                    </div>
                    {selectedRooms.map((room, idx) => (
                      <div key={idx} className="text-sm text-gray-700 mb-2">
                        <div className="font-medium">{room.roomType.name}</div>
                        <div className="text-xs text-gray-600">
                          {room.package.name} × {room.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <h4 className="font-bold text-gray-900 mb-3">Price details</h4>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {nights} {nights === 1 ? "night" : "nights"}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(subtotal, property.currency, locale)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Taxes and charges</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(taxAmount, property.currency, locale)}
                  </span>
                </div>

                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatCurrency(totalAmount, property.currency, locale)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Includes taxes and charges
                  </p>
                </div>
              </div>

              {/* Price Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-green-800">
                    <strong>Great choice!</strong> You won&apos;t be charged yet – this
                    booking is pending confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
