import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminInvoicesPage() {
  await requireRole("ADMIN");

  const invoices = await prisma.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    take: 100,
    include: {
      booking: {
        select: {
          id: true,
          status: true,
          checkIn: true,
          checkOut: true,
          customer: {
            select: {
              email: true,
              fullName: true,
            },
          },
          property: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Management</h2>
        <p className="text-gray-600">Total invoices: {invoices.length}</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {invoice.bookingId.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.booking.customer.fullName || "Not provided"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.booking.customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {invoice.booking.property.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.booking.checkIn.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {invoice.booking.checkOut.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {Number(invoice.totalAmount).toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500">{invoice.currency}</div>
                    {Number(invoice.taxAmount) > 0 && (
                      <div className="text-xs text-gray-500">
                        Tax: {Number(invoice.taxAmount).toFixed(3)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.issuedAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {invoice.pdfUrl ? (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#d32f2f] hover:text-[#b71c1c] font-medium transition-colors"
                      >
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">No PDF</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            {/* Invoice Number & Status */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {invoice.invoiceNumber}
                </div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">
                  ID: {invoice.bookingId.slice(0, 8)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {Number(invoice.totalAmount).toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">{invoice.currency}</div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Customer</div>
              <div className="text-sm font-medium text-gray-900">
                {invoice.booking.customer.fullName || "Not provided"}
              </div>
              <div className="text-xs text-gray-600">
                {invoice.booking.customer.email}
              </div>
            </div>

            {/* Property */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Property</div>
              <div className="text-sm text-gray-900">
                {invoice.booking.property.title}
              </div>
            </div>

            {/* Booking Dates */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Booking Period</div>
              <div className="flex items-center gap-1.5 text-sm text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {invoice.booking.checkIn.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {invoice.booking.checkOut.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Tax & Issued Date */}
            <div className="flex items-center justify-between mb-3">
              <div>
                {Number(invoice.taxAmount) > 0 && (
                  <div className="text-xs text-gray-600">
                    Tax: {Number(invoice.taxAmount).toFixed(3)} {invoice.currency}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Issued: {invoice.issuedAt.toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {invoice.pdfUrl ? (
              <a
                href={invoice.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#d32f2f] text-white font-medium rounded-lg hover:bg-[#b71c1c] transition-colors"
              >
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </a>
            ) : (
              <div className="w-full text-center py-2 text-gray-400 text-sm">
                No PDF available
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
