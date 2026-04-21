"use client";

import { useState } from "react";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-text">{q}</span>
        <span className="text-accent text-lg transition-transform">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 text-sm text-muted leading-relaxed animate-fadeIn">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQClient({ faqs }: any) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted mt-2">
          Everything you need to understand AscendBet
        </p>
      </div>

      {/* FAQ SECTIONS */}
      <div className="space-y-8">

        {faqs?.map((section: any, i: number) => (
          <div key={i}>

            <h2 className="text-xs uppercase tracking-wider text-accent mb-3">
              {section.category}
            </h2>

            <div className="space-y-3">
              {section.items.map((item: any, idx: number) => (
                <FAQItem key={idx} q={item.q} a={item.a} />
              ))}
            </div>

          </div>
        ))}

      </div>

      {/* FOOTER */}
      <div className="mt-10 text-center text-xs text-muted">
        Still have questions? Reach out via Support.
      </div>

    </div>
  );
}