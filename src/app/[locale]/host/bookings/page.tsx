import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db";
import { RefundButton } from "./RefundButton";

export default async function HostBookingsPage() {
  const user = await requireRole("HOST");

  const bookings = await prisma.booking.findMany({
    where: {
      property: { hostId: user.sub },
    },
    include: {
      property: { select: { title: true } },
      payment: { select: { status: true, stripeConnectId: true, platformFee: true, hostAmount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600">When guests book your properties, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                {/* Left: booking details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900 truncate">{booking.property.title}</p>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm text-gray-600">
                    <div>
                      <span className="text-xs text-gray-400 block">Guest</span>
                      <span className="font-medium text-gray-800">{booking.guestFullName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Dates</span>
                      <span>
                        {new Date(booking.checkIn).toLocaleDateString()} –{" "}
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Guests</span>
                      <span>{booking.guests}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Amount</span>
                      <span className="font-medium text-gray-800">
                        {Number(booking.totalAmount).toFixed(3)} {booking.currency}
                      </span>
                    </div>
                  </div>

                  {/* Payment split info for CONFIRMED bookings */}
                  {booking.status === "CONFIRMED" && booking.payment?.hostAmount && (
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="text-green-700 font-medium">
                        You received: {Number(booking.payment.hostAmount).toFixed(3)} {booking.currency}
                      </span>
                      {booking.payment.platformFee && (
                        <span className="text-gray-400">
                          (Platform fee: {Number(booking.payment.platformFee).toFixed(3)} {booking.currency})
                        </span>
                      )}
                      {booking.payment.stripeConnectId && (
                        <span className="text-gray-400">via Stripe Connect</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: actions */}
                <div className="shrink-0">
                  {booking.status === "CONFIRMED" && (
                    <RefundButton
                      bookingId={booking.id}
                      guestName={booking.guestFullName}
                      amount={Number(booking.totalAmount).toFixed(3)}
                      currency={booking.currency}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    PENDING:   "bg-yellow-50 text-yellow-700 border border-yellow-200",
    CONFIRMED: "bg-green-50 text-green-700 border border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border border-red-200",
    COMPLETED: "bg-blue-50 text-blue-700 border border-blue-200",
    REFUNDED:  "bg-gray-50 text-gray-600 border border-gray-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
      statusStyles[status] ?? "bg-gray-100 text-gray-700"
    }`}>
      {status}
    </span>
  );
}

