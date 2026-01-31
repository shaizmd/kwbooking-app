import { requireRole } from "@/lib/auth/require-role";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // HARD server-side enforcement
  await requireRole("HOST");

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

