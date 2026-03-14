import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export default async function HostDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("HOST");

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    propertyCount,
    activeProperties,
    activeBookings,
    pendingBookings,
    totalRevenue,
    monthlyRevenue,
    totalReviews,
    averageRating,
    propertyList,
    recentBookings,
  ] = await Promise.all([
    prisma.property.count({
      where: { hostId: user.sub },
    }),
    prisma.property.count({
      where: { hostId: user.sub, status: "ACTIVE" },
    }),
    prisma.booking.count({
      where: {
        property: { hostId: user.sub },
        status: "CONFIRMED",
      },
    }),
    prisma.booking.count({
      where: {
        property: { hostId: user.sub },
        status: "PENDING",
      },
    }),
    prisma.booking.aggregate({
      where: {
        property: { hostId: user.sub },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.booking.aggregate({
      where: {
        property: { hostId: user.sub },
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: {
          gte: monthAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.review.count({
      where: {
        property: { hostId: user.sub },
      },
    }),
    prisma.review.aggregate({
      where: {
        property: { hostId: user.sub },
      },
      _avg: {
        rating: true,
      },
    }),
    prisma.property.findMany({
      where: { hostId: user.sub },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        basePrice: true,
        currency: true,
        location: true,
        _count: {
          select: { bookings: true },
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        property: { hostId: user.sub },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            title: true,
            currency: true,
          },
        },
        customer: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const revenue = totalRevenue._sum.totalAmount || 0;
  const monthRevenue = monthlyRevenue._sum.totalAmount || 0;
  const avgRating = averageRating._avg.rating || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
          Welcome back, Host!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your properties and track your bookings.
        </p>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Properties"
          value={propertyCount}
          subtitle={`${activeProperties} active`}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Active Bookings"
          value={activeBookings}
          subtitle={`${pendingBookings} pending`}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`${revenue.toFixed(3)} KWD`}
          subtitle={`${monthRevenue.toFixed(3)} KWD this month`}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
        />
        <StatCard
          title="Average Rating"
          value={avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
          subtitle={`${totalReviews} reviews`}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          color="gold"
        />
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href={`/${locale}/host/properties/new`}
            className="btn-primary flex items-center justify-center space-x-3"
            style={{ height: '54px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Property</span>
          </Link>
          <Link
            href={`/${locale}/host/properties`}
            className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg px-6 py-3 font-semibold hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>My Properties</span>
          </Link>
          <Link
            href={`/${locale}/host/bookings`}
            className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg px-6 py-3 font-semibold hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>View Bookings</span>
          </Link>
          <Link
            href={`/${locale}/host/properties`}
            className="flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg px-6 py-3 font-semibold hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>Recent Properties</h2>
            <Link href={`/${locale}/host/properties`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--red)' }}>
              View All
            </Link>
          </div>

          {propertyList.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
              <p className="text-sm text-gray-600 mb-4">Start by adding your first property</p>
              <Link href={`/${locale}/host/properties/new`} className="inline-block btn-primary">
                Add Property
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {propertyList.map((property) => (
                <Link
                  key={property.id}
                  href={`/${locale}/host/properties/${property.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">{property.title}</h4>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {property.location}
                        </span>
                        <span>{property._count.bookings} bookings</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold" style={{ color: 'var(--red)' }}>
                          {formatCurrency(Number(property.basePrice), property.currency, 'en')}
                        </div>
                        <div className="text-xs text-gray-500">per night</div>
                      </div>
                      <StatusBadge status={property.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>Recent Bookings</h2>
            <Link href={`/${locale}/host/bookings`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--red)' }}>
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">{booking.property.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {booking.customer.fullName || booking.customer.email}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                        <span>→</span>
                        <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{booking.guests} guests</span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <div className="font-bold" style={{ color: 'var(--red)' }}>
                        {formatCurrency(Number(booking.totalAmount), booking.property.currency, 'en')}
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "gold";
}) {
  const colorStyles = {
    blue: 'rgba(59, 130, 246, 0.1)',
    green: 'rgba(16, 185, 129, 0.1)',
    purple: 'rgba(139, 92, 246, 0.1)',
    gold: 'var(--gold-soft)',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: colorStyles[color] }}
        >
          {icon}
        </div>
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
      <p className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>{value}</p>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    ACTIVE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    INACTIVE: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    DRAFT: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    CONFIRMED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      {status}
    </span>
  );
}
