import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HeroSection, FeatureCard } from "@/components/animations/HomeAnimations";
import { HostCTA } from "@/components/HostCTA";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Animated Flowing Lines */}
        <div className="flowing-lines">
          <div className="flowing-line"></div>
          <div className="flowing-line"></div>
          <div className="flowing-line"></div>
          <div className="flowing-line"></div>
          <div className="flowing-line"></div>
          <div className="flowing-line"></div>
          <div className="flowing-line"></div>
        </div>

        {/* Glass morphism overlay with red tint */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.04) 0%, rgba(183, 28, 28, 0.06) 100%)',
        }}></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -right-20 w-80 h-80 rounded-full opacity-30 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(211, 47, 47, 0.15), transparent)' }}></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2), transparent)' }}></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(211, 47, 47, 0.2), transparent)' }}></div>
        </div>

        <HeroSection>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ 
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(211, 47, 47, 0.15)'
            }}>
              <svg className="w-5 h-5" style={{ color: 'var(--red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span style={{ color: 'var(--red)' }} className="text-sm font-semibold">{t("hero.badge")}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight" style={{ 
              fontFamily: 'Geometria, system-ui, sans-serif',
              letterSpacing: '-0.02em',
              color: '#010000',
              fontWeight: 800
            }}>
              {t("hero.title")}
            </h1>

            {/* Subtext */}
            <p className="subtext text-lg sm:text-xl lg:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href={`/${locale}/properties`}
                className="btn-primary group transform hover:-translate-y-1 w-full sm:w-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {t("hero.browseProperties")}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              
              <Link
                href={`/${locale}/host/properties/new`}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {t("hero.listProperty")}
                </span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="subtext flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: 'var(--green)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{t("trust.verified")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: 'var(--green)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{t("trust.transparent")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: 'var(--red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{t("trust.support")}</span>
              </div>
            </div>
          </div>
        </div>
        </HeroSection>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
              {t("features.title")}
            </h2>
            <p className="subtext max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard index={0}>
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>{t("features.verified.title")}</h3>
              <p className="subtext">
                {t("features.verified.description")}
              </p>
            </div>
            </FeatureCard>

            <FeatureCard index={1}>
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--green)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>{t("features.pricing.title")}</h3>
              <p className="subtext">
                {t("features.pricing.description")}
              </p>
            </div>
            </FeatureCard>

            <FeatureCard index={2}>
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(10, 88, 255, 0.1)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--blue-price)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>{t("features.support.title")}</h3>
              <p className="subtext">
                {t("features.support.description")}
              </p>
            </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Host CTA Section - Redesigned */}
      <HostCTA locale={locale} />
    </main>
  );
}

