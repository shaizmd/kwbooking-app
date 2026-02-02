import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/format";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("propertyDetails");
  const tCommon = await getTranslations("common");

  const property = await prisma.property.findFirst({
    where: {
      id,
      status: "ACTIVE",
    },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const coverImage = property.images[0];
  const otherImages = property.images.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        href={`/${locale}/properties`}
        className="inline-flex items-center text-gray-700 hover-red font-medium mb-6 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Properties
      </Link>

      {/* Property Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-dark)' }}>
          {property.title}
        </h1>
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-lg">{property.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          {coverImage && (
            <div className="card overflow-hidden" style={{ padding: 0 }}>
              <div className="relative h-96 bg-gray-200">
                <img
                  src={coverImage.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
              {t("about")}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Property Images Gallery */}
          {otherImages.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                Property Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {otherImages.map((img) => (
                  <div key={img.id} className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt={`${property.title} - Image ${img.order}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Pricing & Guest Info */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="card sticky top-8">
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-dark)' }}>
              {t("pricing")}
            </h3>

            <div className="space-y-4 mb-6">
              <div className="pb-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-baseline gap-2">
                  <span className="price-text font-bold text-3xl">
                    {formatCurrency(
                      Number(property.basePrice),
                      property.currency,
                      locale
                    )}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>/ night</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>{t("baseGuests")}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                    {formatNumber(property.baseGuests, locale)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>{t("maxGuests")}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                    {formatNumber(property.maxGuests, locale)}
                  </span>
                </div>

                {property.extraGuestPrice && Number(property.extraGuestPrice) > 0 && (
                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t("extraGuestPrice")}</span>
                    <span className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                      {formatCurrency(
                        Number(property.extraGuestPrice),
                        property.currency,
                        locale
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Button */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <Link
                href={`/${locale}/properties/${id}/book`}
                className="w-full btn-primary block text-center py-4 font-bold"
              >
                {t("bookNow")}
              </Link>
            </div>
          </div>

          {/* Property Features */}
          <div className="card">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
              What this place offers
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-dark)' }}>
                    Sleeps up to {property.maxGuests}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {property.baseGuests} guests included in base price
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--green)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-dark)' }}>
                    {t("verified")}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t("transparentPricing")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
