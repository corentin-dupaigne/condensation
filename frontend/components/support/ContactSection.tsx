"use client";

import { useState } from "react";

export function ContactSection() {
  const [focused, setFocused] = useState("");

  const inputClass = (field: string) =>
    `w-full rounded-lg bg-surface-container-highest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all ${
      focused === field
        ? "ring-1 ring-primary/40 shadow-[0_0_12px_rgba(213,117,255,0.06)]"
        : ""
    }`;

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              Still need help?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Our support team typically responds within 2 hours during business
              hours. For urgent issues with recent orders, include your order
              number for faster resolution.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Email</p>
                  <p className="text-sm text-on-surface-variant">
                    support@condensation.gg
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    Live Chat
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Available Mon-Fri, 9am-6pm UTC
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-tertiary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    Response Time
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    Typically under 2 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-surface-container-high p-6">
            <h3 className="font-headline text-lg font-semibold text-on-surface">
              Send a message
            </h3>
            <form className="mt-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Your name"
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  className={inputClass("name")}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  className={inputClass("email")}
                />
              </div>
              <select
                onFocus={() => setFocused("topic")}
                onBlur={() => setFocused("")}
                className={inputClass("topic")}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a topic
                </option>
                <option>Order issue</option>
                <option>Key not working</option>
                <option>Refund request</option>
                <option>Account problem</option>
                <option>Payment issue</option>
                <option>Other</option>
              </select>
              <input
                type="text"
                placeholder="Order number (optional)"
                onFocus={() => setFocused("order")}
                onBlur={() => setFocused("")}
                className={inputClass("order")}
              />
              <textarea
                rows={4}
                placeholder="Describe your issue..."
                onFocus={() => setFocused("message")}
                onBlur={() => setFocused("")}
                className={`${inputClass("message")} resize-none`}
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-headline text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
