import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import Link from "next/link";
import {
  publishProperty,
  unpublishProperty,
} from "../publish-actions";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("HOST");

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  });

  if (!property || property.hostId !== user.sub) {
    throw new Error("Not found");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/host/properties"
          className="inline-flex items-center text-gray-700 hover-red font-medium mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <p className="text-gray-600">
              Property details and management
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <StatusBadge status={property.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900">{property.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 whitespace-pre-wrap">{property.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900">{property.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                  <p className="price-text font-bold">{property.basePrice.toString()} KWD/night</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Guest Price</label>
                  <p className="price-text font-bold">{property.extraGuestPrice?.toString() || '0'} KWD</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Guests</label>
                  <p className="text-gray-900">{property.baseGuests}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                  <p className="text-gray-900">{property.maxGuests}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Property Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="font-semibold text-gray-900">{property._count.bookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reviews</span>
                <span className="font-semibold text-gray-900">{property._count.reviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Views</span>
                <span className="font-semibold text-gray-900">{property.viewCount}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Status</span>
                <StatusBadge status={property.status} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/host/properties/${id}/images`}
                className="block w-full text-center btn-primary"
              >
                Manage Images
              </Link>
              <button
                className="block w-full text-center bg-white hover-bg-white-light text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition"
              >
                Edit Details
              </button>
              
              {/* Publish/Unpublish */}
              {property.status !== "ACTIVE" ? (
                <form
                  action={async () => {
                    "use server";
                    await publishProperty(property.id);
                  }}
                >
                  <button
                    type="submit"
                    className="block w-full text-center btn-primary"
                  >
                    Publish Property
                  </button>
                </form>
              ) : (
                <form
                  action={async () => {
                    "use server";
                    await unpublishProperty(property.id);
                  }}
                >
                  <button
                    type="submit"
                    className="block w-full text-center bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-300 px-4 py-2 rounded-lg font-medium transition"
                  >
                    Unpublish Property
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles = {
    DRAFT: "bg-gray-100 text-gray-800 border border-gray-300",
    ACTIVE: "bg-green-50 text-green-700 border border-green-200",
    INACTIVE: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    PENDING_APPROVAL: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        statusStyles[status as keyof typeof statusStyles] || statusStyles.DRAFT
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
