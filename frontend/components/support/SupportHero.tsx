"use client";

import { useState } from "react";

export function SupportHero() {
  const [focused, setFocused] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary/5 via-surface to-surface">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--secondary)/0.06,_transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tight text-on-surface md:text-6xl">
            How can we help?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
            Find answers to common questions, troubleshoot issues, or get in
            touch with our support team.
          </p>
          <div className="relative mx-auto mt-8 max-w-lg">
            <input
              type="text"
              placeholder="Search help articles..."
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`w-full rounded-xl bg-surface-container-highest px-5 py-3.5 pl-12 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all ${
                focused
                  ? "ring-1 ring-primary/40 shadow-[0_0_16px_rgba(213,117,255,0.08)]"
                  : ""
              }`}
            />
            <svg
              className="absolute top-1/2 left-4 -translate-y-1/2 text-on-surface-variant"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
