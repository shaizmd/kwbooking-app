"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth/client";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as "HOST" | "CUSTOMER";

    try {
      await register({ email, password, fullName, phone, role });
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
            Create account
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Join our platform today
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="border rounded-lg p-3 text-sm" style={{ backgroundColor: '#fff5f5', borderColor: 'var(--red)', color: 'var(--red)' }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+965 1234 5678"
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
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-dark)' }}>
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition hover-border-red" style={{ borderColor: 'var(--border-light)' }}>
                  <input
                    type="radio"
                    name="role"
                    value="CUSTOMER"
                    defaultChecked
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Book places</span>
                </label>
                <label className="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition hover-border-red" style={{ borderColor: 'var(--border-light)' }}>
                  <input
                    type="radio"
                    name="role"
                    value="HOST"
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>List property</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ height: '48px' }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link href="/login" className="font-semibold" style={{ color: 'var(--red)' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
