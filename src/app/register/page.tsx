"use client";

import { useState } from "react";
import { registerAction } from "@/lib/actions";
import { AuthFooterLink, AuthShell } from "@/components/layout/AuthShell";
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
    <AuthShell
      title="Join the Mandal"
      subtitle="Register to view donations & mandal updates"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" name="name" required placeholder="Your name" />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
        />
        <Input
          label="Mobile Number"
          name="mobile"
          type="tel"
          required
          placeholder="10-digit mobile"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="Min 6 characters"
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          required
        />

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-3.5 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-700 text-sm bg-green-50 border border-green-100 p-3.5 rounded-xl">
            {success}
          </div>
        )}

        <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
          {loading ? "Registering..." : "Create Account"}
        </Button>
      </form>

      <AuthFooterLink
        text="Already have an account?"
        linkText="Sign in"
        href="/login"
      />

      <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
        Admin will approve your account before you can sign in. Use the same
        mobile number registered with the mandal.
      </p>
    </AuthShell>
  );
}
