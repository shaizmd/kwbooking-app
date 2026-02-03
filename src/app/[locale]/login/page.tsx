"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { login, getCurrentUser } from "@/lib/auth/client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          router.push(`/${locale}`);
        }
      })
      .finally(() => setChecking(false));
  }, [router, locale]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login({ email, password });
      router.push(`/${locale}`);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Animated Flowing Lines */}
      <div className="flowing-lines">
        <div className="flowing-line"></div>
        <div className="flowing-line"></div>
        <div className="flowing-line"></div>
      </div>

      <motion.div 
        className="w-full max-w-lg relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--red)' }}>
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>BookStay</span>
          </Link>
          <h1 className="text-4xl font-extrabold mb-3" style={{ color: '#010000', fontWeight: 800 }}>
            Welcome back
          </h1>
          <p className="subtext">
            Sign in to continue to your account
          </p>
        </div>

        {/* Form Card */}
        <motion.div 
          className="bg-white rounded-2xl p-8 shadow-lg border"
          style={{ borderColor: 'rgba(211, 47, 47, 0.1)' }}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                className="border rounded-xl p-4 text-sm flex items-start gap-3"
                style={{ backgroundColor: '#fff5f5', borderColor: 'var(--red)', color: 'var(--red)' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: '#e5e7eb',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: '#e5e7eb',
                  fontSize: '16px'
                }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#d32f2f',
                color: 'white',
              }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="subtext">
              Don&apos;t have an account?{" "}
              <Link href={`/${locale}/register`} className="font-semibold hover:underline" style={{ color: 'var(--red)' }}>
                Create account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <p className="text-center mt-6 subtext text-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
