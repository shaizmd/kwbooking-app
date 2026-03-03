import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminPayoutsPage() {
  await requireRole("ADMIN");

  const payouts = await prisma.hostPayout.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      host: {
        select: {
          id: true,
          email: true,
          fullName: true,
          _count: { select: { properties: true } },
        },
      },
    },
  });

  // Totals summary
  const totalPayments = await prisma.payment.aggregate({
    _sum: { amount: true, platformFee: true, hostAmount: true },
    where: { status: "SUCCESS" },
  });

  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string }
  > = {
    PENDING:     { label: "Not started",  bg: "bg-gray-100",   text: "text-gray-700" },
    IN_PROGRESS: { label: "In progress",  bg: "bg-yellow-100", text: "text-yellow-800" },
    COMPLETE:    { label: "Active",        bg: "bg-green-100",  text: "text-green-800" },
    RESTRICTED:  { label: "Restricted",   bg: "bg-red-100",    text: "text-red-800" },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payouts &amp; Stripe Connect</h2>
        <p className="text-gray-600">
          Manage host sub-merchant accounts and monitor payment settlements.
        </p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total processed</div>
          <div className="text-2xl font-bold text-gray-900">
            {Number(totalPayments._sum.amount ?? 0).toFixed(3)} KWD
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Platform fees earned</div>
          <div className="text-2xl font-bold text-green-700">
            {Number(totalPayments._sum.platformFee ?? 0).toFixed(3)} KWD
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Settled to hosts</div>
          <div className="text-2xl font-bold text-blue-700">
            {Number(totalPayments._sum.hostAmount ?? 0).toFixed(3)} KWD
          </div>
        </div>
      </div>

      {/* Hosts table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            Host Connect Accounts ({payouts.length})
          </h3>
        </div>

        {payouts.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            No hosts have configured payout details yet.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Host", "Legal name", "Tax ID", "Bank", "Connect Status", "Charges", "Payouts", "Fee %", "Properties"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {payouts.map((p) => {
                    const cfg = statusConfig[p.onboardingStatus] ?? statusConfig.PENDING;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{p.host.fullName ?? "—"}</div>
                          <div className="text-xs text-gray-500">{p.host.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{p.legalName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{p.taxId ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{p.bankName ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          {p.stripeConnectId && (
                            <div className="text-xs text-gray-400 font-mono mt-1">{p.stripeConnectId}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-medium ${p.chargesEnabled ? "text-green-600" : "text-gray-400"}`}>
                            {p.chargesEnabled ? "✓" : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-medium ${p.payoutsEnabled ? "text-green-600" : "text-gray-400"}`}>
                            {p.payoutsEnabled ? "✓" : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                          {p.platformFeePercent ? `${p.platformFeePercent}%` : "10% (default)"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                          {p.host._count.properties}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {payouts.map((p) => {
                const cfg = statusConfig[p.onboardingStatus] ?? statusConfig.PENDING;
                return (
                  <div key={p.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.host.fullName ?? p.host.email}</div>
                        <div className="text-xs text-gray-500">{p.legalName}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {p.taxId && <span>Tax ID: {p.taxId}</span>}
                      {p.bankName && <span>Bank: {p.bankName}</span>}
                      <span>Fee: {p.platformFeePercent ? `${p.platformFeePercent}%` : "10% (default)"}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className={p.chargesEnabled ? "text-green-600" : "text-gray-400"}>
                        {p.chargesEnabled ? "✓ Charges" : "✗ Charges"}
                      </span>
                      <span className={p.payoutsEnabled ? "text-green-600" : "text-gray-400"}>
                        {p.payoutsEnabled ? "✓ Payouts" : "✗ Payouts"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Hosts without payout setup */}
      <HostsWithoutPayout />
    </div>
  );
}

async function HostsWithoutPayout() {
  const hostsWithoutPayout = await prisma.user.findMany({
    where: {
      role: "HOST",
      hostPayout: null,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      createdAt: true,
      _count: { select: { properties: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (hostsWithoutPayout.length === 0) return null;

  return (
    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-yellow-900 mb-3">
        ⚠ Hosts without payout setup ({hostsWithoutPayout.length})
      </h3>
      <p className="text-sm text-yellow-800 mb-4">
        These hosts have not configured their payout details. Payments to them
        will be processed through the platform account (no automatic split).
      </p>
      <div className="space-y-2">
        {hostsWithoutPayout.map((h) => (
          <div key={h.id} className="flex items-center justify-between text-sm">
            <span className="text-yellow-900">{h.fullName ?? h.email}</span>
            <span className="text-yellow-700">{h._count.properties} properties</span>
          </div>
        ))}
      </div>
    </div>
  );
}
