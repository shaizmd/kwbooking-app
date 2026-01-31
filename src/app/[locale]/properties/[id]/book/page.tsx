import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/format";
import Link from "next/link";
import { createBooking } from "./actions";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  // Check if user is logged in and is a customer
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (!token) {
    redirect(`/${locale}/login?redirect=/properties/${id}/book`);
  }

  let user;
  try {
    user = verifyAccessToken(token);
  } catch {
    redirect(`/${locale}/login?redirect=/properties/${id}/book`);
  }

  if (user.role !== "CUSTOMER") {
    redirect(`/${locale}/properties/${id}`);
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
    },
  });

  if (!property) {
    notFound();
  }

  const coverImage = property.images[0];

  async function handleBooking(formData: FormData) {
    "use server";

    await createBooking({
      propertyId: id,
      checkIn: formData.get("checkIn") as string,
      checkOut: formData.get("checkOut") as string,
      guests: Number(formData.get("guests")),
    });
  }

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        href={`/${locale}/properties/${id}`}
        className="inline-flex items-center text-gray-700 hover-red font-medium mb-6 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Property
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
          Complete Your Booking
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review property details and confirm your reservation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Booking Form */}
        <div className="lg:col-span-2">
          <form action={handleBooking} className="card">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-dark)' }}>
              Booking Details
            </h2>

            <div className="space-y-6">
              {/* Check-in Date */}
              <div>
                <label htmlFor="checkIn" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
                  Check-in Date
                </label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  min={today}
                  required
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{ borderColor: 'var(--border-light)' }}
                />
              </div>

              {/* Check-out Date */}
              <div>
                <label htmlFor="checkOut" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
                  Check-out Date
                </label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  min={today}
                  required
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{ borderColor: 'var(--border-light)' }}
                />
              </div>

              {/* Number of Guests */}
              <div>
                <label htmlFor="guests" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
                  Number of Guests
                </label>
                <input
                  type="number"
                  id="guests"
                  name="guests"
                  min="1"
                  max={property.maxGuests}
                  defaultValue={property.baseGuests}
                  required
                  className="w-full px-4 py-3 border rounded-lg transition-all"
                  style={{ borderColor: 'var(--border-light)' }}
                />
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  Maximum {property.maxGuests} guests allowed. Base price includes {property.baseGuests} guest{property.baseGuests > 1 ? 's' : ''}.
                </p>
                {property.extraGuestPrice && Number(property.extraGuestPrice) > 0 && (
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Extra guests: {formatCurrency(Number(property.extraGuestPrice), property.currency, locale)} per guest per night
                  </p>
                )}
              </div>

              {/* Important Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Booking Terms</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Minimum stay: 1 night</li>
                      <li>• Your booking will be pending until confirmed by the host</li>
                      <li>• Prices are locked at time of booking</li>
                      <li>• Check cancellation policy before booking</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full btn-primary py-4 text-lg font-bold"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Property Summary */}
        <div className="space-y-6">
          {/* Property Card */}
          <div className="card sticky top-8">
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
              Property Summary
            </h3>

            {/* Property Image */}
            {coverImage && (
              <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden mb-4">
                <img
                  src={coverImage.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Property Details */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-lg" style={{ color: 'var(--text-dark)' }}>
                  {property.title}
                </h4>
                <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{property.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="price-text font-bold text-2xl">
                    {formatCurrency(
                      Number(property.basePrice),
                      property.currency,
                      locale
                    )}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>/ night</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Base guests</span>
                    <span style={{ color: 'var(--text-dark)' }}>{property.baseGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Max guests</span>
                    <span style={{ color: 'var(--text-dark)' }}>{property.maxGuests}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="card">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
              Why book with us
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--green)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-dark)' }}>
                    Secure payments
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Your payment is protected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--green)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-dark)' }}>
                    Transparent pricing
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    No hidden fees
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-dark)' }}>
                    24/7 support
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    We're here to help
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
