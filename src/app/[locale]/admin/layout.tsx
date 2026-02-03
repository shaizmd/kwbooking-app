import { requireRole } from "@/lib/auth/require-role";
import Link from "next/link";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await requireRole("ADMIN");
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#d32f2f] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">System Management</p>
              </div>
            </div>
            <Link
              href={`/${locale}`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto">
            <Link
              href={`/${locale}/admin`}
              className="py-4 px-1 border-b-2 border-transparent hover:border-[#d32f2f] text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Dashboard
            </Link>
            <Link
              href={`/${locale}/admin/users`}
              className="py-4 px-1 border-b-2 border-transparent hover:border-[#d32f2f] text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Users
            </Link>
            <Link
              href={`/${locale}/admin/properties`}
              className="py-4 px-1 border-b-2 border-transparent hover:border-[#d32f2f] text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Properties
            </Link>
            <Link
              href={`/${locale}/admin/bookings`}
              className="py-4 px-1 border-b-2 border-transparent hover:border-[#d32f2f] text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Bookings
            </Link>
            <Link
              href={`/${locale}/admin/invoices`}
              className="py-4 px-1 border-b-2 border-transparent hover:border-[#d32f2f] text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Invoices
            </Link>
            <Link
              href={`/${locale}/admin/settings`}
              className="py-4 px-1 border-b-2 border-transparent hover:border-[#d32f2f] text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
