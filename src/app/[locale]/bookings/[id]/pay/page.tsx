import { notFound, redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getBookingForPayment } from "@/app/[locale]/properties/[id]/book/actions";
import { PaymentForm } from "./PaymentForm";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (!token) {
    redirect(`/${locale}/login?redirect=/bookings/${id}/pay`);
  }

  let user;
  try {
    user = verifyAccessToken(token);
  } catch {
    redirect(`/${locale}/login?redirect=/bookings/${id}/pay`);
  }

  if (user.role !== "CUSTOMER") {
    redirect(`/${locale}`);
  }

  // Get booking with property details
  const booking = await getBookingForPayment(id);

  if (!booking || booking.customerId !== user.sub) {
    notFound();
  }

  // If already confirmed, redirect to bookings
  if (booking.status === "CONFIRMED") {
    redirect(`/${locale}/bookings`);
  }

  const nights = Math.ceil(
    (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-gray-600">Secure payment powered by Stripe</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
            
            <PaymentForm bookingId={id} locale={locale} />
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
            
            {/* Property Image */}
            {booking.property.images[0] && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={booking.property.images[0].imageUrl}
                  alt={booking.property.title}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            {/* Property Details */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">{booking.property.title}</h3>
              <p className="text-sm text-gray-600">{booking.property.location}</p>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              {/* Dates */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Check-in</span>
                <span className="text-gray-900 font-medium">
                  {booking.checkIn.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Check-out</span>
                <span className="text-gray-900 font-medium">
                  {booking.checkOut.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nights</span>
                <span className="text-gray-900 font-medium">{nights}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Guests</span>
                <span className="text-gray-900 font-medium">{booking.guests}</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {formatCurrency(Number(booking.property.basePrice), booking.currency, locale)} × {nights} nights
                </span>
                <span className="text-gray-900">
                  {formatCurrency(Number(booking.property.basePrice) * nights, booking.currency, locale)}
                </span>
              </div>
              
              {Number(booking.totalAmount) > Number(booking.property.basePrice) * nights && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Extra guest charges</span>
                  <span className="text-gray-900">
                    {formatCurrency(Number(booking.totalAmount) - Number(booking.property.basePrice) * nights, booking.currency, locale)}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-semibold" style={{ color: 'var(--red)' }}>
                  {formatCurrency(Number(booking.totalAmount), booking.currency, locale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
