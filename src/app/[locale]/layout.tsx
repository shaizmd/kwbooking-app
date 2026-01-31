import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales, localeDirection, type Locale } from "@/config/locales";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import "../globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} dir={localeDirection[locale as Locale]}>
      <body className="min-h-screen bg-gray-50 antialiased flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
