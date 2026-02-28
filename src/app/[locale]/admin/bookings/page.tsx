import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminBookingsPage() {
  await requireRole("ADMIN");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      property: {
        select: {
          title: true,
        },
      },
      customer: {
        select: {
          email: true,
          fullName: true,
        },
      },
      payment: {
        select: {
          status: true,
          provider: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Management</h2>
        <p className="text-gray-600">Total bookings: {bookings.length}</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => {
                const nights = Math.ceil(
                  (booking.checkOut.getTime() - booking.checkIn.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {booking.property.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.customer.fullName || "Not provided"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.checkIn.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {booking.checkOut.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {nights} {nights === 1 ? "night" : "nights"} • {booking.guests}{" "}
                        guests
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {Number(booking.totalAmount).toFixed(3)}
                      </div>
                      <div className="text-xs text-gray-500">{booking.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : booking.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.payment ? (
                        <div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.payment.status === "SUCCESS"
                                ? "bg-green-100 text-green-800"
                                : booking.payment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.payment.status}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {booking.payment.provider}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No payment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {bookings.map((booking) => {
          const nights = Math.ceil(
            (booking.checkOut.getTime() - booking.checkIn.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{booking.property.title}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    #{booking.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    booking.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : booking.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : booking.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Customer:</span>
                  <span className="ml-2 text-gray-900">
                    {booking.customer.fullName || "Not provided"}
                  </span>
                  <div className="text-xs text-gray-500 ml-2">{booking.customer.email}</div>
                </div>

                <div>
                  <span className="text-gray-500">Dates:</span>
                  <span className="ml-2 text-gray-900">
                    {booking.checkIn.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {booking.checkOut.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="text-xs text-gray-500 ml-2">
                    {nights} {nights === 1 ? "night" : "nights"} • {booking.guests} guests
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Amount:</span>
                  <span className="ml-2 text-gray-900 font-semibold">
                    {Number(booking.totalAmount).toFixed(3)} {booking.currency}
                  </span>
                </div>

                {booking.payment && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Payment:</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.payment.status === "SUCCESS"
                          ? "bg-green-100 text-green-800"
                          : booking.payment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.payment.status}
                    </span>
                    <span className="text-xs text-gray-500">({booking.payment.provider})</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                  Created: {booking.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
