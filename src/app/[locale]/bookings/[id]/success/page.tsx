import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ payment_intent?: string }>;
}) {
  const { locale, id } = await params;
  const { payment_intent } = await searchParams;
  const t = await getTranslations("paymentSuccess");

  // Check authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (!token) {
    redirect(`/${locale}/login`);
  }

  let user;
  try {
    user = verifyAccessToken(token);
  } catch {
    redirect(`/${locale}/login`);
  }

  // Get booking with invoice
  const booking = await prisma.booking.findUnique({
    where: { id },
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
          id: true,
          amount: true,
          status: true,
        },
      },
      invoice: {
        select: {
          invoiceNumber: true,
          pdfUrl: true,
          issuedAt: true,
        },
      },
    },
  });

  if (!booking || booking.customerId !== user.sub) {
    notFound();
  }

  const nights = Math.ceil(
    (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-lg text-gray-600">{t("subtitle")}</p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Property Image */}
        {booking.property.images[0] && (
          <div className="h-48 overflow-hidden relative">
            <Image
              src={booking.property.images[0].imageUrl}
              alt={booking.property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
            />
          </div>
        )}

        <div className="p-6">
          {/* Property Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{booking.property.title}</h2>
            <p className="text-gray-600">{booking.property.location}</p>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 pb-6 border-b border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("bookingId")}</span>
              <span className="font-mono text-sm text-gray-900">{booking.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in</span>
              <span className="font-medium text-gray-900">
                {booking.checkIn.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out</span>
              <span className="font-medium text-gray-900">
                {booking.checkOut.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nights</span>
              <span className="font-medium text-gray-900">{nights}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests</span>
              <span className="font-medium text-gray-900">{booking.guests}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">{t("status")}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t("confirmed")}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-900">{t("totalPaid")}</span>
              <span className="text-xl font-semibold" style={{ color: 'var(--red)' }}>
                {formatCurrency(Number(booking.totalAmount), booking.currency, locale)}
              </span>
            </div>
            {payment_intent && (
              <p className="text-xs text-gray-500 mt-2">
                {t("paymentId")}: {payment_intent.slice(0, 20)}...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="rounded-lg p-6 mb-6 border" style={{ backgroundColor: 'var(--gold-soft)', borderColor: 'var(--border-light)' }}>
        <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("whatsNext")}
        </h3>
        <ul className="text-sm space-y-1 ml-7" style={{ color: 'var(--text-muted)' }}>
          <li>• {t("confirmationEmail")}</li>
          <li>• {t("viewInBookings")}</li>
          <li>• {t("hostContact")}</li>
          {booking.invoice && (
            <li>• {t("invoiceReady")}</li>
          )}
        </ul>
      </div>

      {/* Invoice Download */}
      {booking.invoice && booking.invoice.pdfUrl && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#d32f2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t("invoice")}</h3>
                <p className="text-sm text-gray-600">
                  {booking.invoice.invoiceNumber} • {t("issued")} {booking.invoice.issuedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <a
              href={booking.invoice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#d32f2f] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#b71c1c] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t("download")}
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/${locale}/bookings`}
          className="flex-1 bg-[#d32f2f] text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-[#b71c1c] transition-colors"
        >
          {t("backToBookings")}
        </Link>
        <Link
          href={`/${locale}/properties`}
          className="flex-1 bg-white text-gray-700 text-center py-3 px-6 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Browse More Properties
        </Link>
      </div>
    </div>
  );
}
