"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { AuthFooterLink, AuthShell } from "@/components/layout/AuthShell";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new FormData(e.currentTarget);
      const result = await loginAction(
        form.get("email") as string,
        form.get("password") as string
      );
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Member Portal"
      subtitle="Sign in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="Enter your email"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="Enter your password"
        />
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-3.5 rounded-xl">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <AuthFooterLink
        text="Don't have an account?"
        linkText="Register here"
        href="/register"
      />
    </AuthShell>
  );
}
