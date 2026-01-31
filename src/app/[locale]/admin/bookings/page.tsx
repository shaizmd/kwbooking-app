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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Management</h2>
        <p className="text-gray-600">Total bookings: {bookings.length}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                            ? "bg-blue-100 text-blue-800"
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
    </div>
  );
}
