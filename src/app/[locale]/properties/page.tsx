import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

export default async function PublicPropertiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const properties = await prisma.property.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
          Available Properties
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Browse verified properties with transparent pricing
        </p>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
            No properties available
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Check back soon for new listings
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const coverImage = property.images[0];
            
            return (
              <Link
                key={property.id}
                href={`/${locale}/properties/${property.id}`}
                className="card overflow-hidden transition hover:-translate-y-0.5"
                style={{ padding: 0, marginBottom: 0 }}
              >
                {/* Property Image */}
                <div className="h-48 relative">
                  {coverImage ? (
                    <img
                      src={coverImage.imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div style={{ background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.8), rgba(211, 47, 47, 0.5))' }} className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div style={{ padding: '20px' }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-3" style={{ color: 'var(--text-muted)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="price-text font-bold text-xl">
                        {formatCurrency(
                          Number(property.basePrice),
                          property.currency,
                          locale
                        )}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        per night
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm">Up to {property.maxGuests}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
