"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔥 PREFILL USER EMAIL */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setEmail(data.user.email);
      }
    };
    getUser();
  }, []);

  /* 🔥 SUBMIT FUNCTION (CLEAN + SAFE) */
  const handleSend = async () => {
    if (!email || !message) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user?.id ?? null,
          email,
          message,
        });

      if (error) throw error;

      // ✅ SUCCESS
      alert("Message sent successfully!");

      setMessage("");

    } catch (err: any) {
      console.error("Support error:", err);
      alert(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 space-y-8">

      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-white">
          Support
        </h1>
        <p className="text-sm text-muted mt-2">
          Need help? Send us a message.
        </p>
      </div>

      {/* FORM */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">

        <h2 className="text-sm font-semibold text-white">
          Contact Support
        </h2>

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-white outline-none"
        />

        <textarea
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-white outline-none"
        />

        <button
          onClick={handleSend}
          disabled={loading || !email || !message}
          className="w-full py-3 rounded-lg bg-accent text-white text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

      </div>

      {/* FAQ SHORTCUT */}
      <div className="rounded-2xl border border-border bg-surface p-5">

        <h2 className="text-sm font-semibold text-white mb-2">
          Quick Help
        </h2>

        <p className="text-xs text-muted mb-3">
          Check answers to common questions.
        </p>

        <Link href="/faq" className="text-accent text-sm font-medium">
          → Go to FAQ
        </Link>

      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-muted">
        We typically respond within 24–48 hours.
      </div>

    </div>
  );
}