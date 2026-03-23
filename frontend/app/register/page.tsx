"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  faSteam,
  faXbox,
  faPlaystation,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";

const OAUTH_PROVIDERS = [
  { icon: faGoogle, label: "Google", hoverColor: "group-hover:text-secondary" },
  { icon: faSteam, label: "Steam", hoverColor: "group-hover:text-secondary" },
  { icon: faXbox, label: "Xbox", hoverColor: "group-hover:text-tertiary" },
  {
    icon: faPlaystation,
    label: "PlayStation",
    hoverColor: "group-hover:text-primary",
  },
  {
    icon: faDiscord,
    label: "Discord",
    hoverColor: "group-hover:text-primary",
  },
];

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <main className="relative flex min-h-screen grow items-center justify-center overflow-hidden px-6 pt-24 pb-16">
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute left-0 bottom-1/4 h-100 w-100 rounded-full bg-secondary/5 blur-[100px]" />

        {/* Auth Card */}
        <div className="z-10 w-full max-w-120">
          <div className="glass-panel rounded-2xl border border-outline-variant/10 p-10 shadow-2xl">
            <header className="mb-8 text-center">
              <h1 className="mb-2 font-headline text-5xl font-black uppercase tracking-tighter text-on-surface">
                SIGN UP
              </h1>
              <p className="font-medium tracking-tight text-on-surface-variant">
                Forge your account. Enter the armory.
              </p>
            </header>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {/* Username */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="ml-1 block text-xs font-bold tracking-[0.2em] uppercase text-primary/80"
                >
                  Username
                </label>
                <div className="group relative">
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="ghost_operative"
                    className="w-full rounded-xl border-none bg-surface-container-highest px-4 py-4 text-sm text-on-surface placeholder:text-outline/50 outline-none transition-all focus:ring-1 focus:ring-primary/40"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="ml-1 block text-xs font-bold tracking-[0.2em] uppercase text-primary/80"
                >
                  Email
                </label>
                <div className="group relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="identity@neonvoid.market"
                    className="w-full rounded-xl border-none bg-surface-container-highest px-4 py-4 text-sm text-on-surface placeholder:text-outline/50 outline-none transition-all focus:ring-1 focus:ring-primary/40"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="ml-1 block text-xs font-bold tracking-[0.2em] uppercase text-primary/80"
                >
                  Password
                </label>
                <div className="group relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="8+ characters"
                    className="w-full rounded-xl border-none bg-surface-container-highest px-4 py-4 pr-12 text-sm text-on-surface placeholder:text-outline/50 outline-none transition-all focus:ring-1 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="ml-1 block text-xs font-bold tracking-[0.2em] uppercase text-primary/80"
                >
                  Confirm Password
                </label>
                <div className="group relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Repeat your security key"
                    className="w-full rounded-xl border-none bg-surface-container-highest px-4 py-4 pr-12 text-sm text-on-surface placeholder:text-outline/50 outline-none transition-all focus:ring-1 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full" />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreed}
                  onClick={() => setAgreed((v) => !v)}
                  className={`mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border transition-all ${
                    agreed
                      ? "border-primary bg-primary"
                      : "border-outline bg-surface-container-highest hover:border-primary/60"
                  }`}
                >
                  {agreed && (
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full p-0.5"
                    >
                      <path
                        d="M3 8l3.5 3.5L13 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-on-primary-fixed"
                      />
                    </svg>
                  )}
                </button>
                <p className="text-sm text-on-surface-variant leading-snug">
                  I agree to the{" "}
                  <a href="#" className="font-semibold text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-semibold text-primary hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!agreed}
                className="mt-2 w-full cursor-pointer rounded-xl bg-linear-to-r from-primary to-primary-container py-4 font-headline text-base font-black uppercase tracking-tight text-on-primary-fixed shadow-[0_0_20px_rgba(213,117,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Create Account
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8 flex items-center">
              <div className="grow border-t border-outline-variant/20" />
              <span className="mx-4 shrink-0 text-xs font-bold uppercase tracking-[0.25em] text-outline">
                or sign up with
              </span>
              <div className="grow border-t border-outline-variant/20" />
            </div>

            {/* OAuth Grid */}
            <div className="grid grid-cols-5 gap-3">
              {OAUTH_PROVIDERS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  aria-label={`Sign up with ${p.label}`}
                  className="group flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-surface-container-highest transition-colors hover:bg-surface-bright"
                >
                  <FontAwesomeIcon
                    icon={p.icon}
                    className={`h-5 w-5 text-on-surface-variant transition-colors ${p.hoverColor}`}
                  />
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="ml-1 font-bold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer strip */}
      <footer className="flex flex-col items-center gap-3 py-8">
        <div className="flex flex-wrap justify-center gap-6">
          {["Terms of Service", "Privacy Policy", "Cookie Settings", "Support"].map(
            (label) => (
              <a
                key={label}
                href="#"
                className="text-xs font-body uppercase tracking-widest text-primary/60 transition-all hover:text-secondary hover:opacity-100"
              >
                {label}
              </a>
            ),
          )}
        </div>
        <p className="text-xs font-body uppercase tracking-widest text-on-surface-variant/40">
          &copy; {new Date().getFullYear()} Condensation. All rights reserved.
        </p>
      </footer>

      {/* Background texture */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDryjzjbVGhAOCuW15jmcZHhpz8JQZYpbkMjeUKgtbZosKZkoXS-Uu3yWaG4cx3uL6RLP2V71mqomDxjrDQKX8r-vQJpfbPJENw-746ekN9nQ980D_XYCQYKi-EbsouTj9WIv78B8QA4IegRjIpHMcYkWAXL-OpuESUWsHrN5lAIkgrbM1S_IywMZMNkSz-80g9kYPX2Wi1nWcA41fw3QvMB39B7RKOnDPcCM6Doa3nLumbgR05gKZ-54cifq2-sa2DkX-7d-HJTrAr"
        />
      </div>
    </>
  );
}
