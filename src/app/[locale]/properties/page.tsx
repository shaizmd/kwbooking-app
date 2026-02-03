import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";
import { Prisma } from "@prisma/client";

export default async function PublicPropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; sort?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { locale } = await params;
  const { type, sort, minPrice, maxPrice } = await searchParams;
  const t = await getTranslations("properties");

  // Build filter conditions
  const whereClause: Prisma.PropertyWhereInput = {
    status: "ACTIVE",
  };

  if (type && type !== "all") {
    whereClause.propertyType = type.toUpperCase();
  }

  if (minPrice || maxPrice) {
    whereClause.basePrice = {};
    if (minPrice) whereClause.basePrice.gte = parseFloat(minPrice);
    if (maxPrice) whereClause.basePrice.lte = parseFloat(maxPrice);
  }

  // Build order by
  let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
  
  if (sort === "price-low") {
    orderBy = { basePrice: "asc" };
  } else if (sort === "price-high") {
    orderBy = { basePrice: "desc" };
  } else if (sort === "rating") {
    orderBy = { averageRating: "desc" };
  } else if (sort === "featured") {
    orderBy = { featured: "desc" };
  }

  const properties = await prisma.property.findMany({
    where: whereClause,
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      amenities: {
        take: 5,
        include: {
          amenity: true,
        },
      },
    },
    orderBy,
  });

  const propertyTypes = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: { propertyType: true },
    distinct: ["propertyType"],
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="text-white" style={{ backgroundColor: 'var(--red)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-semibold mb-2">
            {t("title")}
          </h1>
          <p className="text-sm" style={{ opacity: 0.9 }}>
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-80 shrink-0">
            <PropertyFilters
              propertyTypes={propertyTypes.map((pt) => pt.propertyType)}
              currentType={type}
              currentSort={sort}
              currentMinPrice={minPrice}
              currentMaxPrice={maxPrice}
            />
          </div>

          {/* Properties List */}
          <div className="flex-1">
            {properties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {t("noProperties")}
                </h3>
                <p className="text-gray-600">
                  {t("noPropertiesDesc")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property, index) => (
                  <PropertyCard 
                    key={property.id}
                    property={{
                      ...property,
                      basePrice: Number(property.basePrice),
                      extraGuestPrice: property.extraGuestPrice ? Number(property.extraGuestPrice) : null,
                      averageRating: property.averageRating ? Number(property.averageRating) : null,
                    }}
                    locale={locale}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
