"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-mandal-cream via-white to-mandal-cream-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-mandal-saffron/5 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-mandal-gold/5 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-mandal-saffron to-mandal-gold items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
            ॐ
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-mandal-maroon leading-tight">
            Bolinjcha Vighnaharta
          </h1>
          <p className="text-mandal-maroon/70 mt-1">Sarvajanik Utsav Mandal</p>
          <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-mandal-saffron font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          गणपती बाप्पा मोरया
        </p>
      </div>
    </div>
  );
}
