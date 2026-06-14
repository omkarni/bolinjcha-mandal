"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions";
import { Button, Input } from "@/components/ui";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    const result = await registerAction(data);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || "Registration successful!");
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-mandal-cream via-white to-mandal-cream-dark">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-br from-mandal-saffron to-mandal-gold items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
            ॐ
          </div>
          <h1 className="font-display text-2xl font-bold text-mandal-maroon">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Register to view your donations & mandal updates
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="name" required placeholder="Your name" />
            <Input label="Email" name="email" type="email" required placeholder="your@email.com" />
            <Input
              label="Mobile Number"
              name="mobile"
              type="tel"
              required
              placeholder="10-digit mobile (used to link your donations)"
            />
            <Input label="Password" name="password" type="password" required placeholder="Min 6 characters" />
            <Input label="Confirm Password" name="confirmPassword" type="password" required />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{success}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-mandal-saffron font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Admin will approve your account before you can sign in.
            Use the same mobile number registered with the mandal for donation linking.
          </p>
        </div>
      </div>
    </div>
  );
}
