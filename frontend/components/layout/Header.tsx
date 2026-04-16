"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartCount, clearCart } from "@/lib/cart-store";
import { useBalance, useBalanceLoaded, fetchBalance } from "@/lib/balance-store";
import { TopUpModal } from "@/components/wallet/TopUpModal";
import type { Game } from "@/lib/types";
import { formatCents } from "@/lib/format-price";

const navLinks = [
  { label: "Store", href: "/" },
  { label: "Browse", href: "/games" },
  { label: "Deals", href: "#" },
  { label: "Support", href: "#" },
];

interface PreviewResult {
  games: Game[];
  total: number;
}

export function Header({ isLoggedIn = false, userName = null }: { isLoggedIn?: boolean, userName?: string | null }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartCount = useCartCount();
  const balance = useBalance();
  const balanceLoaded = useBalanceLoaded();

  useEffect(() => {
    if (isLoggedIn) fetchBalance();
  }, [isLoggedIn]);

  const showPreview = searchFocused && searchQuery.trim().length > 0;

  const fetchPreview = useCallback(async (query: string) => {
    if (!query.trim()) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    try {
      const url = `/api/steam/games?search=${encodeURIComponent(query.trim())}&size=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setPreview({
        games: (data.content ?? []) as Game[],
        total: data.totalElements ?? 0,
      });
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setPreview(null);
        return;
      }
      debounceRef.current = setTimeout(() => fetchPreview(value), 300);
    },
    [fetchPreview],
  );

  function handleSearchSubmit() {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const initials = userName ? userName.charAt(0).toUpperCase() : "P";

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface-container/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center gap-6 px-6">
        <Link href="/" className="shrink-0 font-headline text-xl font-bold tracking-tight text-primary">
          CONDENSATION
        </Link>

        <nav className="ml-10 hidden items-center gap-5 md:flex">
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

        <div className="relative ml-auto flex-1 max-w-md" ref={searchRef}>
          <input
            type="text"
            placeholder="Search games, DLC, gift cards..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
              if (e.key === "Escape") setSearchFocused(false);
            }}
            className={`w-full rounded-lg bg-surface-container-highest px-4 py-2 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all ${searchFocused
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

          {showPreview && (
            <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-high shadow-2xl">
              {previewLoading && !preview && (
                <div className="px-4 py-6 text-center text-xs text-on-surface-variant">
                  Searching…
                </div>
              )}

              {preview && preview.games.length > 0 && (
                <>
                  {preview.games.map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-container-highest"
                      onClick={() => setSearchFocused(false)}
                    >
                      {game.headerImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={game.headerImage}
                          alt={game.name}
                          className="h-10 w-16 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-16 shrink-0 rounded bg-surface-container-highest" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-on-surface">
                          {game.name}
                        </p>
                        {game.genres.length > 0 && (
                          <p className="truncate text-xs text-on-surface-variant">
                            {game.genres.slice(0, 3).map((g) => g.description).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {game.reductionPercentage > 0 && (
                          <span className="mr-1.5 text-xs font-semibold text-primary">
                            -{game.reductionPercentage}%
                          </span>
                        )}
                        <span className="text-sm font-bold text-on-surface">
                          {formatCents(game.priceFinal)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    className="flex items-center justify-center gap-1.5 border-t border-outline-variant/20 px-4 py-3 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-highest"
                    onClick={() => setSearchFocused(false)}
                  >
                    See all {preview.total} result{preview.total !== 1 ? "s" : ""}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </>
              )}

              {preview && preview.games.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-on-surface-variant">
                  No results for &ldquo;{searchQuery.trim()}&rdquo;
                </div>
              )}
            </div>
          )}
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

          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setTopUpOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-surface-container-highest px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-bright"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2.5" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                </svg>
                {balanceLoaded ? (
                  <span className="tabular-nums">${balance.toFixed(2)}</span>
                ) : (
                  <span className="inline-block h-3.5 w-12 animate-pulse rounded bg-on-surface/10" />
                )}
              </button>
              <TopUpModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />
            </div>
          )}

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
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    >
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-outline-variant/20 py-1">
                    <button
                      onClick={() => { clearCart(); window.location.href = "/api/auth/logout"; }}
                      className="block w-full px-4 py-2 text-left text-sm text-error transition-colors hover:bg-error/10"
                    >
                      Logout
                    </button>
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
