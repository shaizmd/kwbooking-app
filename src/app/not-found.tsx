import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -right-20 w-80 h-80 rounded-full opacity-30 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(211, 47, 47, 0.15), transparent)' }}></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2), transparent)' }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(211, 47, 47, 0.2), transparent)' }}></div>
      </div>

      <div className="text-center relative z-10 max-w-2xl mx-auto">
        {/* Large 404 Number */}
        <div className="mb-8">
          <h1 
            className="text-9xl sm:text-[12rem] font-extrabold leading-none mb-2"
            style={{ 
              fontFamily: 'Geometria, system-ui, sans-serif',
              background: 'linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.05em',
              textShadow: '0 0 60px rgba(211, 47, 47, 0.1)',
            }}
          >
            404
          </h1>
        </div>

        {/* Icon Container */}
        <div 
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-8"
          style={{ 
            backgroundColor: 'rgba(211, 47, 47, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(211, 47, 47, 0.15)'
          }}
        >
          <svg 
            className="w-12 h-12" 
            style={{ color: 'var(--red)' }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 
          className="text-4xl sm:text-5xl font-bold mb-6"
          style={{ 
            fontFamily: 'Geometria, system-ui, sans-serif',
            color: '#010000',
            letterSpacing: '-0.02em'
          }}
        >
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved, deleted, or you might have mistyped the URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="btn-primary group transform hover:-translate-y-1 w-full sm:w-auto"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Back Home
            </span>
          </Link>
          
          <Link
            href="/properties"
            className="group px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 w-full sm:w-auto"
            style={{ 
              backgroundColor: 'white',
              color: '#222222',
              border: '2px solid var(--border-light)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Properties
            </span>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Need help? Try these popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors" style={{ color: 'var(--red)' }}>
              Login
            </Link>
            <Link href="/register" className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors" style={{ color: 'var(--red)' }}>
              Register
            </Link>
            <Link href="/host/properties/new" className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors" style={{ color: 'var(--red)' }}>
              List Property
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
