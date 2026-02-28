import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminUsersPage() {
  await requireRole("ADMIN");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      fullName: true,
      isKycApproved: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
          bookings: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-600">Total users: {users.length}</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName || "Not provided"}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {user.id.slice(0, 8)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.phone && (
                      <div className="text-xs text-gray-500">{user.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "HOST"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                          user.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Unverified"}
                      </span>
                      {user.role === "HOST" && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                            user.isKycApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isKycApproved ? "KYC Approved" : "KYC Pending"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === "HOST" && (
                      <div>{user._count.properties} properties</div>
                    )}
                    {user.role === "CUSTOMER" && (
                      <div>{user._count.bookings} bookings</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {user.fullName || "Not provided"}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1">{user.id.slice(0, 8)}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.role === "ADMIN"
                    ? "bg-purple-100 text-purple-800"
                    : user.role === "HOST"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.role}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 text-gray-900">{user.email}</span>
              </div>
              {user.phone && (
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 text-gray-900">{user.phone}</span>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
                {user.role === "HOST" && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isKycApproved
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isKycApproved ? "KYC Approved" : "KYC Pending"}
                  </span>
                )}
              </div>
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                {user.role === "HOST" && <div>{user._count.properties} properties</div>}
                {user.role === "CUSTOMER" && <div>{user._count.bookings} bookings</div>}
                <div className="mt-1">Joined: {user.createdAt.toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
