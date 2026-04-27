"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (resetMode) {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (err) setError(err.message);
        else setMessage("Password reset email sent.");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-2">
      <div className="pb-1">
       <Link
          href="/signup"
          className="mb-4 ml-auto text-sm font-medium text-accent hover:text-accent/80"
        >
          Create an Account
        </Link>
        </div>

        <div className="w-full rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h1 className="mb-6 text-center text-lg font-medium text-text">
            {resetMode ? "Reset Password" : "Sign In"}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
              {email && (
                <span
                  className={`absolute right-3 top-3 text-sm ${emailValid ? "text-success" : "text-danger"}`}
                >
                  {emailValid ? "✓" : "✗"}
                </span>
              )}
            </div>

            {!resetMode && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-xs text-muted"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-accent py-3 font-medium text-text hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? "Please wait…"
                : resetMode
                  ? "Send Reset Email"
                  : "Sign In"}
            </button>
          </form>

          {!resetMode && (
            <button
              type="button"
              onClick={() => {
                setResetMode(true);
                setError(null);
              }}
              className="mt-4 w-full text-center text-sm text-muted hover:text-text"
            >
              Forgot password?
            </button>
          )}

          {resetMode && (
            <button
              type="button"
              onClick={() => {
                setResetMode(false);
                setError(null);
              }}
              className="mt-4 w-full text-center text-sm text-muted hover:text-text"
            >
              Back to Sign In
            </button>
          )}
        </div>

        <p className="mt-6 text-sm text-muted">
          <Link href="/" className="hover:text-text">← Back to home</Link>
        </p>
        </div>
    </AuthLayout>
  );
}
