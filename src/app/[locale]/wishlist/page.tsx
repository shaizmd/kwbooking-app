import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { removeFromWishlist } from "./actions";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("wishlist");
  let user;
  try {
    user = await requireRole("CUSTOMER");
  } catch (err) {
    redirect(`/${locale}/login`);
  }

  const wishlistItems = await prisma.wishlist.findMany({
    where: {
      userId: user.sub,
    },
    include: {
      property: {
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? "property" : "properties"} saved
          </p>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Start exploring and save your favorite properties
              </p>
              <Link
                href={`/${locale}/properties`}
                className="btn-primary inline-block"
              >
                Browse properties
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const property = item.property;
              const coverImage = property.images[0];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Property Image */}
                  <Link href={`/${locale}/properties/${property.id}`}>
                    <div className="relative h-56 bg-gray-200">
                      {coverImage ? (
                        <Image
                          src={coverImage.imageUrl}
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      {property.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Property Info */}
                  <div className="p-4">
                    <Link href={`/${locale}/properties/${property.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-red-700 transition-colors">
                        {property.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                      {property.location}
                    </div>

                    {property.averageRating && property.averageRating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="flex items-center gap-1 text-white px-2 py-1 rounded text-xs font-semibold"
                          style={{ backgroundColor: "var(--red)" }}
                        >
                          {property.averageRating.toFixed(1)}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({property.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-2 mb-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          Number(property.basePrice),
                          property.currency,
                          locale
                        )}
                      </div>
                      <div className="text-sm text-gray-600">per night</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/${locale}/properties/${property.id}`}
                        className="flex-1 px-4 py-2 text-center border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View details
                      </Link>
                      <form action={removeFromWishlist}>
                        <input type="hidden" name="propertyId" value={property.id} />
                        <input type="hidden" name="locale" value={locale} />
                        <button
                          type="submit"
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          title="Remove from wishlist"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
