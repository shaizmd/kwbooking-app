import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditPropertyDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await requireRole("HOST");

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      hostId: true,
      title: true,
      description: true,
      location: true,
      basePrice: true,
      baseGuests: true,
      maxGuests: true,
      extraGuestPrice: true,
      checkInTime: true,
      checkOutTime: true,
    },
  });

  if (!property || property.hostId !== user.sub) {
    redirect(`/${locale}/host/properties`);
  }

  async function updatePropertyAction(formData: FormData) {
    "use server";

    const currentUser = await requireRole("HOST");
    const currentProperty = await prisma.property.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!currentProperty || currentProperty.hostId !== currentUser.sub) {
      throw new Error("Unauthorized");
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const basePrice = Number(formData.get("basePrice") || 0);
    const baseGuests = Number(formData.get("baseGuests") || 0);
    const maxGuests = Number(formData.get("maxGuests") || 0);
    const extraGuestPrice = Number(formData.get("extraGuestPrice") || 0);
    const checkInTime = String(formData.get("checkInTime") || "14:00");
    const checkOutTime = String(formData.get("checkOutTime") || "11:00");

    if (title.length < 5) {
      throw new Error("Title must be at least 5 characters");
    }
    if (description.length < 20) {
      throw new Error("Description must be at least 20 characters");
    }
    if (location.length < 2) {
      throw new Error("Location must be at least 2 characters");
    }
    if (basePrice <= 0) {
      throw new Error("Base price must be greater than 0");
    }
    if (baseGuests <= 0 || maxGuests <= 0) {
      throw new Error("Guest values must be greater than 0");
    }
    if (maxGuests < baseGuests) {
      throw new Error("Max guests cannot be less than base guests");
    }

    await prisma.property.update({
      where: { id },
      data: {
        title,
        description,
        location,
        basePrice,
        baseGuests,
        maxGuests,
        extraGuestPrice,
        checkInTime,
        checkOutTime,
      },
    });

    redirect(`/${locale}/host/properties/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/${locale}/host/properties/${id}`}
          className="inline-flex items-center text-gray-700 hover-red font-medium mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Property
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Edit Property Details</h1>
      </div>

      <form action={updatePropertyAction} className="card space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            id="title"
            name="title"
            required
            defaultValue={property.title}
            className="w-full px-4 py-2 border rounded-lg border-gray-300"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            defaultValue={property.description}
            className="w-full px-4 py-2 border rounded-lg border-gray-300"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            id="location"
            name="location"
            required
            defaultValue={property.location}
            className="w-full px-4 py-2 border rounded-lg border-gray-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">Base Price (KWD)</label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min="0.001"
              step="0.001"
              required
              defaultValue={Number(property.basePrice)}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="extraGuestPrice" className="block text-sm font-medium text-gray-700 mb-1">Extra Guest Price (KWD)</label>
            <input
              id="extraGuestPrice"
              name="extraGuestPrice"
              type="number"
              min="0"
              step="0.001"
              defaultValue={Number(property.extraGuestPrice ?? 0)}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="baseGuests" className="block text-sm font-medium text-gray-700 mb-1">Base Guests</label>
            <input
              id="baseGuests"
              name="baseGuests"
              type="number"
              min="1"
              required
              defaultValue={property.baseGuests}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
            <input
              id="maxGuests"
              name="maxGuests"
              type="number"
              min="1"
              required
              defaultValue={property.maxGuests}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
            <input
              id="checkInTime"
              name="checkInTime"
              defaultValue={property.checkInTime ?? "14:00"}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
            <input
              id="checkOutTime"
              name="checkOutTime"
              defaultValue={property.checkOutTime ?? "11:00"}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">Save Changes</button>
          <Link
            href={`/${locale}/host/properties/${id}`}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}