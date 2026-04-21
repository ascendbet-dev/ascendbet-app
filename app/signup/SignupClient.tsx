"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/AuthLayout";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function checkUsername(name: string) {
    if (!name) {
      setUsernameAvailable(null);
      return;
    }

    const clean = name.trim().toLowerCase();

    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", clean)
      .maybeSingle();

    setUsernameAvailable(data ? false : true);
  }

  function passwordStrength(p: string) {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { label: "Weak", width: "25%", color: "bg-danger" };
    if (score === 2 || score === 3)
      return { label: "Medium", width: "60%", color: "bg-accent" };
    return { label: "Strong", width: "100%", color: "bg-success" };
  }

  const strength = passwordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanUsername = username.trim().toLowerCase();

      /* 🔒 VALIDATIONS */
      if (!emailValid) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      if (!cleanUsername || cleanUsername.length < 3) {
        setError("Username must be at least 3 characters");
        setLoading(false);
        return;
      }

      if (usernameAvailable === false) {
        setError("Username already taken");
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      /* 🔐 SIGN UP */
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      if (signUpError) {
        console.log("REAL SIGNUP ERROR:", signUpError);
        setError(signUpError.message); // 👈 show real error
        setLoading(false);
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        setError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      /* 🔥 PROFILE WRITE */
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        username: cleanUsername,
        first_name: firstName || null,
        last_name: lastName || null,
        dob: dob || null,
      });

      if (profileError) {
        console.log("PROFILE ERROR:", profileError);
        setError("Failed to save profile");
        setLoading(false);
        return;
      }

      /* ---------------- REFERRAL (SAFE) ---------------- */

      if (refCode) {
        try {
          const { data: refUser } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", refCode)
            .maybeSingle();

          if (refUser && refUser.id !== userId) {
            await supabase.from("referrals").insert({
              referrer_id: refUser.id,
              referred_user_id: userId,
            });
          }
        } catch (err) {
          console.log("REFERRAL ERROR (SAFE):", err);
        }
      }

      setShowConfirmModal(true);

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>

      <div className="mb-4 flex w-full justify-end">
        <Link
          href="/login"
          className="text-sm font-medium text-accent hover:text-accent/80"
        >
          Already have an account
        </Link>
      </div>

      <div className="w-full rounded-2xl border border-border bg-surface p-5 shadow-sm">

          <h1 className="mb-6 text-center text-lg font-medium text-text">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={username}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  setUsername(value);
                  checkUsername(value);
                }}
                className="input"
              />

              {username && usernameAvailable === true && (
                <span className="absolute right-3 top-3 text-sm text-success">✓</span>
              )}
              {username && usernameAvailable === false && (
                <span className="absolute right-3 top-3 text-sm text-danger">✗</span>
              )}
            </div>

            <input type="text" placeholder="First Name" value={firstName} required onChange={(e) => setFirstName(e.target.value)} className="input" />
            <input type="text" placeholder="Last Name" value={lastName} required onChange={(e) => setLastName(e.target.value)} className="input" />
            <input type="date" value={dob} required onChange={(e) => setDob(e.target.value)} className="input" />

            <input type="email" placeholder="Email" value={email} required onChange={(e) => setEmail(e.target.value)} className="input" />

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

            {password && (
              <div>
                <div className="h-1 w-full rounded bg-border">
                  <div className={`h-1 rounded ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  Password strength: {strength.label}
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-accent py-3 font-medium text-text hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Please wait…" : "Sign Up"}
            </button>

          </form>
        </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#140a26] p-6 text-center border border-border">
            <h2 className="text-lg font-semibold text-white mb-2">
              Confirm Your Email
            </h2>
            <p className="text-sm text-muted mb-4">
              We’ve sent a confirmation link to your email.
            </p>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="w-full py-3 rounded-lg bg-accent text-white text-sm font-semibold"
            >
              Okay
            </button>
          </div>
        </div>
      )}

    </AuthLayout>
  );
}