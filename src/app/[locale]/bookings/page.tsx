import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { getTranslations } from "next-intl/server";

export default async function CustomerBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("myBookings");

  // Require CUSTOMER role
  const user = await requireRole("CUSTOMER");

  // Get all bookings for customer
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: user.sub,
    },
    include: {
      property: {
        select: {
          title: true,
          location: true,
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      },
      payment: {
        select: {
          status: true,
        },
      },
      invoice: {
        select: {
          invoiceNumber: true,
          pdfUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("noBookings")}</h3>
          <p className="text-gray-600 mb-6">{t("noBookingsDesc")}</p>
          <Link
            href={`/${locale}/properties`}
            className="inline-block bg-[#d32f2f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#b71c1c] transition-colors"
          >
            {t("browseProperties")}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const nights = Math.ceil(
              (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );

            const statusColors: Record<string, string> = {
              PENDING: "bg-yellow-100 text-yellow-800",
              CONFIRMED: "bg-green-100 text-green-800",
              CANCELLED: "bg-red-100 text-red-800",
              COMPLETED: "bg-blue-100 text-blue-800",
              REFUNDED: "bg-gray-100 text-gray-800",
            };

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Property Image */}
                  {booking.property.images[0] && (
                    <div className="sm:w-48 h-48 sm:h-auto shrink-0">
                      <img
                        src={booking.property.images[0].imageUrl}
                        alt={booking.property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.property.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{booking.property.location}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[booking.status]
                        }`}
                      >
                        {t(booking.status.toLowerCase() as "pending" | "confirmed" | "cancelled" | "completed")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Check-in</p>
                        <p className="font-medium text-gray-900">
                          {booking.checkIn.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Check-out</p>
                        <p className="font-medium text-gray-900">
                          {booking.checkOut.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Nights</p>
                        <p className="font-medium text-gray-900">{nights}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="font-bold text-[#d32f2f]">
                          {formatCurrency(Number(booking.totalAmount), booking.currency, locale)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      {booking.status === "PENDING" && (
                        <Link
                          href={`/${locale}/bookings/${booking.id}/pay`}
                          className="inline-flex items-center gap-2 bg-[#d32f2f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#b71c1c] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {t("completePayment")}
                        </Link>
                      )}

                      {booking.invoice && booking.invoice.pdfUrl && (
                        <a
                          href={booking.invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {t("invoice")}
                        </a>
                      )}

                      <Link
                        href={`/${locale}/properties/${booking.propertyId}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                      >
                        View Property
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
