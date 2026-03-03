import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import Link from "next/link";
import { savePayoutDetails } from "./actions";
import { StripeConnectButton } from "./StripeConnectButton";

export default async function HostPayoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string; stripe?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const userPayload = await requireRole("HOST");

  const payout = await prisma.hostPayout.findUnique({
    where: { hostId: userPayload.sub },
  });

  // Mask account number for safe display
  const maskedAccount = payout?.accountNumber
    ? "•".repeat(Math.max(0, payout.accountNumber.length - 4)) +
      payout.accountNumber.slice(-4)
    : "";

  type OnboardingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETE" | "RESTRICTED";
  const connectStatus: OnboardingStatus =
    (payout?.onboardingStatus as OnboardingStatus) ?? "PENDING";

  const autoSync = sp.stripe === "return";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Link href={`/${locale}/host/account`} className="hover:text-gray-900 transition-colors">
            Account
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Payouts &amp; Banking</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Payouts &amp; Banking</h1>
          <p className="text-gray-600">
            Set up how you receive payments from bookings. Money settles directly
            into your bank account — the platform never holds your funds.
          </p>
        </div>

        {/* Alerts */}
        {sp.success === "saved" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
            ✓ Details saved successfully.
          </div>
        )}
        {sp.error === "legal-name-required" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
            Legal name is required.
          </div>
        )}
        {sp.stripe === "return" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm font-medium">
            ⟳ Syncing your Stripe Connect status…
          </div>
        )}

        {/* How it works */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">How payouts work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>Guest pays at checkout — money goes directly to your bank account via Stripe.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>Platform retains a small fee (set per your subscription plan).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
              <span>Refunds are issued from your connected Stripe account, not the platform.</span>
            </div>
          </div>
        </div>

        {/* Stripe Connect Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Stripe Connect</h2>
          <p className="text-sm text-gray-500 mb-5">
            Connect your Stripe Express account to enable direct bank payouts.
          </p>

          <StripeConnectButton
            status={connectStatus}
            chargesEnabled={payout?.chargesEnabled ?? false}
            payoutsEnabled={payout?.payoutsEnabled ?? false}
            detailsSubmitted={payout?.detailsSubmitted ?? false}
            hasPayoutRecord={!!payout}
            autoSync={autoSync}
          />

          {payout?.stripeConnectId && (
            <p className="mt-4 text-xs text-gray-400 font-mono">
              Account ID: {payout.stripeConnectId}
            </p>
          )}
        </div>

        {/* Legal & Banking Details Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Legal &amp; Bank Details</h2>
          <p className="text-sm text-gray-500 mb-6">
            Required for tax compliance and payment processing. This information is
            securely stored and used only for settlement purposes.
          </p>

          <form action={savePayoutDetails} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />

            {/* Section: Legal Identity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Legal Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="legalName">
                    Legal name / Business name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="legalName"
                    name="legalName"
                    type="text"
                    required
                    defaultValue={payout?.legalName ?? ""}
                    placeholder="As registered with tax authorities"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="taxId">
                    Tax ID (VAT / GST / Civil ID)
                  </label>
                  <input
                    id="taxId"
                    name="taxId"
                    type="text"
                    defaultValue={payout?.taxId ?? ""}
                    placeholder="e.g. 123456789012345"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="businessType">
                    Business type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    defaultValue={payout?.businessType ?? "individual"}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="individual">Individual / Sole proprietor</option>
                    <option value="company">Company / Corporation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Section: Bank Account */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Bank Account
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="bankName">
                    Bank name
                  </label>
                  <input
                    id="bankName"
                    name="bankName"
                    type="text"
                    defaultValue={payout?.bankName ?? ""}
                    placeholder="e.g. National Bank of Kuwait"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="accountHolderName">
                    Account holder name
                  </label>
                  <input
                    id="accountHolderName"
                    name="accountHolderName"
                    type="text"
                    defaultValue={payout?.accountHolderName ?? ""}
                    placeholder="As it appears on your bank statement"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="accountNumber">
                    IBAN / Account number
                  </label>
                  <input
                    id="accountNumber"
                    name="accountNumber"
                    type="text"
                    defaultValue={maskedAccount}
                    placeholder="KW81CBKU0000000000001234560101"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    For Kuwait: IBAN (30 characters). Stored securely — only last 4 digits shown.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="routingCode">
                    SWIFT / BIC code
                  </label>
                  <input
                    id="routingCode"
                    name="routingCode"
                    type="text"
                    defaultValue={payout?.routingCode ?? ""}
                    placeholder="e.g. CBKUKWKW"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Save details
              </button>
            </div>
          </form>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-gray-400 leading-relaxed">
          By setting up payouts, you agree to{" "}
          <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">
            Stripe's Connected Account Agreement
          </a>. The property is the merchant of record and is responsible for GST/VAT on room tariffs,
          refund liability, and chargeback disputes. The platform acts as a technology provider only.
        </p>
      </div>
    </div>
  );
}
