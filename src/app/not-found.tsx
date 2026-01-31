import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          404 – Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Go Back Home
        </Link>
      </div>
    </main>
  );
}
