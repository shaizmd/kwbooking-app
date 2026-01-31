import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function HostDashboard() {
  const user = await requireRole("HOST");

  const [propertyCount, activeBookings, totalRevenue, propertyList] = await Promise.all([
    prisma.property.count({
      where: { hostId: user.sub },
    }),
    prisma.booking.count({
      where: {
        property: { hostId: user.sub },
        status: "CONFIRMED",
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
    prisma.property.findMany({
      where: { hostId: user.sub },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        basePrice: true,
        _count: {
          select: { bookings: true },
        },
      },
    }),
  ]);

  const revenue = totalRevenue._sum.totalAmount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
          Welcome back, Host!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your properties and track your bookings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Properties"
          value={propertyCount}
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
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/host/properties/new"
            className="btn-primary flex items-center justify-center space-x-3"
            style={{ height: '54px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Property</span>
          </Link>
          <Link
            href="/host/properties"
            className="flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-bold transition hover-bg-red-light"
            style={{ backgroundColor: 'white', color: 'var(--text-dark)', border: '2px solid var(--border-light)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>View All Properties</span>
          </Link>
        </div>
      </div>

      {/* Recent Properties */}
      {propertyList.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>Recent Properties</h2>
            <Link
              href="/host/properties"
              className="font-semibold text-sm"
              style={{ color: 'var(--red)' }}
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {propertyList.map((property) => (
              <Link
                key={property.id}
                href={`/host/properties/${property.id}`}
                className="flex items-center justify-between p-4 rounded-lg border transition hover-bg-red-light"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>{property.title}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="price-text font-bold">{property.basePrice.toString()} KWD</span>
                    <span>•</span>
                    <span>{property._count.bookings} bookings</span>
                  </div>
                </div>
                <div className="ml-4">
                  <StatusBadge status={property.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple";
}) {
  const colorClasses = {
    blue: { bg: 'rgba(10, 88, 255, 0.1)', color: 'var(--blue-price)' },
    green: { bg: 'rgba(46, 125, 50, 0.1)', color: 'var(--green)' },
    purple: { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' },
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: colorClasses[color].bg, color: colorClasses[color].color }}>{icon}</div>
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
      <p className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles = {
    DRAFT: { bg: '#f5f5f5', color: 'var(--text-muted)' },
    ACTIVE: { bg: '#e8f5e9', color: 'var(--green)' },
    INACTIVE: { bg: '#fff8e1', color: '#f57c00' },
    PENDING_APPROVAL: { bg: 'rgba(10, 88, 255, 0.1)', color: 'var(--blue-price)' },
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.DRAFT;

  return (
    <span
      className="badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

