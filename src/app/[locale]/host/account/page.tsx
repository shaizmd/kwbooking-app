import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-role";
import Link from "next/link";
import { updateHostProfile, changeHostPassword } from "./actions";

export default async function HostAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const userPayload = await requireRole("HOST");

  const user = await prisma.user.findUnique({
    where: { id: userPayload.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
          bookings: true,
        },
      },
    },
  });

  const hostPayout = await prisma.hostPayout.findUnique({
    where: { hostId: userPayload.sub },
    select: { onboardingStatus: true, chargesEnabled: true },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Host Account
          </h1>
          <p className="text-gray-600">
            Manage your host profile and account details
          </p>
        </div>

        {/* Account Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Account Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {user._count.properties}
              </div>
              <div className="text-sm text-gray-600">Total properties</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {user._count.bookings}
              </div>
              <div className="text-sm text-gray-600">Total bookings</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {user.role}
              </div>
              <div className="text-sm text-gray-600">Account type</div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href={`/${locale}/host/properties`}
              className="btn-primary"
            >
              View my properties
            </Link>
            <Link
              href={`/${locale}/host/bookings`}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View bookings
            </Link>
          </div>
        </div>

        {/* Payouts Banner */}
        <div className={`rounded-lg border p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          hostPayout?.onboardingStatus === "COMPLETE"
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
        }`}>
          <div>
            <h3 className={`font-semibold text-sm mb-1 ${
              hostPayout?.onboardingStatus === "COMPLETE" ? "text-green-900" : "text-amber-900"
            }`}>
              {hostPayout?.onboardingStatus === "COMPLETE"
                ? "✓ Stripe payouts active"
                : "⚠ Stripe payouts not set up"}
            </h3>
            <p className={`text-sm ${
              hostPayout?.onboardingStatus === "COMPLETE" ? "text-green-700" : "text-amber-700"
            }`}>
              {hostPayout?.onboardingStatus === "COMPLETE"
                ? "Payment settlements are going directly to your bank account."
                : "Set up Stripe Connect to receive payments directly in your bank account."}
            </p>
          </div>
          <Link
            href={`/${locale}/host/account/payout`}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              hostPayout?.onboardingStatus === "COMPLETE"
                ? "bg-green-700 hover:bg-green-800 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            {hostPayout?.onboardingStatus === "COMPLETE" ? "Manage payouts" : "Set up payouts →"}
          </Link>
        </div>

        {/* Personal Information (editable, like customer profile) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>

          <form action={updateHostProfile}>
            <input type="hidden" name="locale" value={locale} />

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  defaultValue={user.fullName || ""}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={user.phone || ""}
                  placeholder="+965 XXXX XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member since
                </label>
                <div className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="btn-primary"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Change Password
          </h2>

          <form action={changeHostPassword}>
            <input type="hidden" name="locale" value={locale} />

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Current password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm new password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  minLength={8}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Update password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

