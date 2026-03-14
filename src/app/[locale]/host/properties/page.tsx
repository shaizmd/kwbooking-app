import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function HostPropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("HOST");

  const properties = await prisma.property.findMany({
    where: { hostId: user.sub },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>My Properties</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your property listings and update availability
          </p>
        </div>
        <Link
          href={`/${locale}/host/properties/new`}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center justify-center space-x-2"
          style={{ height: '48px', paddingLeft: '24px', paddingRight: '24px' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Property</span>
        </Link>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>No properties yet</h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Start earning by listing your first property. It only takes a few minutes!
          </p>
          <Link
            href={`/${locale}/host/properties/new`}
            className="btn-primary inline-flex items-center space-x-2"
            style={{ height: '48px', paddingLeft: '24px', paddingRight: '24px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Your First Property</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({
  property,
  locale,
}: {
  property: {
    id: string;
    title: string;
    status: string;
    basePrice: number | { toNumber: () => number } | string;
    location: string;
    baseGuests: number;
    maxGuests: number;
    _count: {
      bookings: number;
      reviews: number;
    };
  };
  locale: string;
}) {
  return (
    <Link
      href={`/${locale}/host/properties/${property.id}`}
      className="card overflow-hidden transition hover:-translate-y-0.5"
      style={{ padding: 0, marginBottom: 0 }}
    >
      {/* Image Placeholder */}
      <div className="h-48 relative" style={{ background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.8), rgba(211, 47, 47, 0.5))' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <div className="absolute top-4 right-4">
          <StatusBadge status={property.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-semibold mb-2 line-clamp-1" style={{ color: 'var(--text-dark)' }}>
          {property.title}
        </h3>

        <div className="flex items-center text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{property.location}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {property.baseGuests}-{property.maxGuests} guests
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <p className="text-xl font-semibold price-text">{property.basePrice.toString()} KWD</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>per night</p>
          </div>
          <div className="text-right text-sm" style={{ color: 'var(--text-muted)' }}>
            <p>{property._count.bookings} bookings</p>
            <p>{property._count.reviews} reviews</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles = {
    DRAFT: { bg: 'rgba(0, 0, 0, 0.7)', color: 'white' },
    ACTIVE: { bg: 'var(--green)', color: 'white' },
    INACTIVE: { bg: '#f57c00', color: 'white' },
    PENDING_APPROVAL: { bg: 'var(--blue-price)', color: 'white' },
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.DRAFT;

  return (
    <span
      className="badge"
      style={{ backgroundColor: style.bg, color: style.color, backdropFilter: 'blur(8px)' }}
    >
      {status}
    </span>
  );
}

