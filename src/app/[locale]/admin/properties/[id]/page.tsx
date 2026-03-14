import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPropertyDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  noStore();
  await requireRole("ADMIN");

  const { locale, id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      images: {
        orderBy: { order: "asc" },
        take: 5,
        select: {
          id: true,
          imageUrl: true,
          order: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          images: true,
          blockedDates: true,
          reviews: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Property Info</h1>
          <p className="text-sm text-gray-600 mt-1">Admin details for property review and moderation</p>
        </div>
        <Link
          href={`/${locale}/admin/properties`}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
        >
          Back to Properties
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase text-gray-500">Title</p>
              <p className="text-base font-semibold text-gray-900">{property.title}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Property ID</p>
              <p className="text-sm font-mono text-gray-700 break-all">{property.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-900">{property.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase text-gray-500">Host</p>
              <p className="text-sm font-medium text-gray-900">{property.host.fullName || "Not provided"}</p>
              <p className="text-sm text-gray-700">{property.host.email}</p>
              <p className="text-sm text-gray-700">{property.host.phone || "No phone"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Location</p>
              <p className="text-sm text-gray-900">{property.location}</p>
              <p className="text-sm text-gray-700">{property.city || "-"}, {property.country}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Pricing</p>
              <p className="text-sm text-gray-900">
                {Number(property.basePrice).toFixed(3)} {property.currency} / night
              </p>
              <p className="text-sm text-gray-700">Guests: {property.baseGuests} base · {property.maxGuests} max</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Stats</p>
              <p className="text-sm text-gray-700">Bookings: {property._count.bookings}</p>
              <p className="text-sm text-gray-700">Images: {property._count.images}</p>
              <p className="text-sm text-gray-700">Blocked dates: {property._count.blockedDates}</p>
              <p className="text-sm text-gray-700">Reviews: {property._count.reviews}</p>
            </div>
          </div>
        </div>

        {property.adminNotes && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs uppercase text-amber-700">Admin Notes</p>
            <p className="text-sm text-amber-900 mt-1 whitespace-pre-wrap">{property.adminNotes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Images</h2>

        {property.images.length === 0 ? (
          <p className="text-sm text-gray-600">No images uploaded.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {property.images.map((image) => (
              <div key={image.id} className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={image.imageUrl}
                  alt={property.title}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div className="px-3 py-2 text-xs text-gray-700 flex items-center justify-between">
                  <span>Order: {image.order}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
