"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            Never Miss A Legendary Deal
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Join 2.5 million gamers getting the best prices, exclusive pre-orders, and
            weekly rarity drops directly in their inbox.
          </p>

          <div className="mt-8 flex gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter your email"
                className={`w-full rounded-xl bg-surface-container-highest px-5 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all ${
                  focused
                    ? "ring-1 ring-primary/40 shadow-[0_0_16px_rgba(161,250,255,0.08)]"
                    : ""
                }`}
              />
            </div>
            <button className="shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary-container px-8 py-3.5 font-headline text-sm font-bold text-on-primary-fixed transition-opacity hover:opacity-90">
              Subscribe
            </button>
          </div>

          <p className="mt-4 text-xs text-on-surface-variant/60">
            By subscribing, you agree to our privacy policy and terms of service.
          </p>
        </div>
      </div>
    </section>
  );
}
