"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCartCount } from "@/lib/cart-store";

const navLinks = [
  { label: "Store", href: "/" },
  { label: "Browse", href: "/games" },
  { label: "Deals", href: "#" },
  { label: "Support", href: "#" },
];

export function Header({ isLoggedIn = false, userName = null }: { isLoggedIn?: boolean, userName?: string | null }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartCount = useCartCount();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = userName ? userName.charAt(0).toUpperCase() : "P";

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface-container/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="shrink-0 font-headline text-xl font-bold tracking-tight text-primary">
          CONDENSATION
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="relative ml-auto flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search games, DLC, gift cards..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full rounded-lg bg-surface-container-highest px-4 py-2 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all ${
              searchFocused
                ? "ring-1 ring-primary/40 shadow-[0_0_12px_rgba(161,250,255,0.1)]"
                : ""
            }`}
          />
          <svg
            className="absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant"
            width="16"
            height="16"
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

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <a
                href="/api/auth/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
              >
                Sign In
              </a>
              <a
                href="/api/auth/register"
                className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
              >
                Sign Up
              </a>
            </>
          ) : null}
          <Link
            href="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Cart"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold tabular-nums text-on-primary">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>

          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
                aria-label="User menu"
              >
                {initials}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-outline-variant/20 bg-surface-container-high shadow-xl">
                  <div className="border-b border-outline-variant/20 px-4 py-3">
                    <p className="text-sm font-semibold text-on-surface">
                      Hi, {userName || "Player"}
                    </p>
                  </div>
                  <div className="py-1">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    >
                      My Profile
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    >
                      Settings
                    </a>
                  </div>
                  <div className="border-t border-outline-variant/20 py-1">
                    <a
                      href="/api/auth/logout"
                      className="block px-4 py-2 text-sm text-error transition-colors hover:bg-error/10"
                    >
                      Logout
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
