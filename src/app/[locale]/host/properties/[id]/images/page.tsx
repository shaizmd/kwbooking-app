import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { ImageUploadForm } from "./ImageUploadForm";

export default async function PropertyImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("HOST");

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      hostId: true,
      images: {
        orderBy: { order: "asc" },
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
          href={`/host/properties/${id}`}
          className="inline-flex items-center text-gray-700 hover-red font-medium mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Property
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Manage Images</h1>
        <p className="text-gray-600">{property.title}</p>
      </div>

      {/* Upload Section */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Image</h2>
        <ImageUploadForm propertyId={id} />
        <p className="text-sm text-gray-600 mt-4">
          Tip: Upload high-quality images (at least 1920x1080) to showcase your property.
          The first image will be the cover photo.
        </p>
      </div>

      {/* Images Grid */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Current Images ({property.images.length})
        </h2>
        {property.images.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No images uploaded yet</h3>
            <p className="text-gray-600">
              Upload your first image to make your property listing more attractive
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {property.images.map((image, index) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="aspect-[4/3] bg-gray-100 relative">
                  <Image
                    src={image.imageUrl}
                    alt={`Property image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-[var(--red)] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                      Cover Photo
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

