import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminPropertiesPage() {
  await requireRole("ADMIN");

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      host: {
        select: {
          email: true,
          fullName: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          images: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Management</h2>
        <p className="text-gray-600">Total properties: {properties.length}</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {property.title}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {property.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {property.host.fullName || "Not provided"}
                    </div>
                    <div className="text-xs text-gray-500">{property.host.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {Number(property.basePrice).toFixed(3)} {property.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        property.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : property.status === "DRAFT"
                          ? "bg-gray-100 text-gray-800"
                          : property.status === "PENDING_APPROVAL"
                          ? "bg-yellow-100 text-yellow-800"
                          : property.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : property.status === "BLOCKED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{property._count.bookings} bookings</div>
                    <div className="text-xs">{property._count.images} images</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1">{property.id.slice(0, 8)}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                  property.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : property.status === "DRAFT"
                    ? "bg-gray-100 text-gray-800"
                    : property.status === "PENDING_APPROVAL"
                    ? "bg-yellow-100 text-yellow-800"
                    : property.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : property.status === "BLOCKED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {property.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Host:</span>
                <span className="ml-2 text-gray-900">
                  {property.host.fullName || "Not provided"}
                </span>
                <div className="text-xs text-gray-500 ml-2">{property.host.email}</div>
              </div>

              <div>
                <span className="text-gray-500">Location:</span>
                <span className="ml-2 text-gray-900">{property.location}</span>
              </div>

              <div>
                <span className="text-gray-500">Price:</span>
                <span className="ml-2 text-gray-900 font-semibold">
                  {Number(property.basePrice).toFixed(3)} {property.currency}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                <div>{property._count.bookings} bookings • {property._count.images} images</div>
                <div className="mt-1">Created: {property.createdAt.toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
