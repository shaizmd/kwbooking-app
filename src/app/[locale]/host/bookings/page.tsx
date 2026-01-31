import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db";

export default async function HostBookingsPage() {
  const user = await requireRole("HOST");

  const bookings = await prisma.booking.findMany({
    where: {
      property: { hostId: user.sub },
    },
    include: {
      property: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Bookings
      </h1>

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600">
            When guests book your properties, they will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="card hover-bg-white-lighter transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">
                    {booking.property.title}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <StatusBadge status={booking.status} />
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
  const statusStyles = {
    PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
    CANCELLED: "bg-red-50 text-red-700 border border-red-200",
    COMPLETED: "bg-green-50 text-green-700 border border-green-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        statusStyles[status as keyof typeof statusStyles] || statusStyles.PENDING
      }`}
    >
      {status}
    </span>
  );
}
