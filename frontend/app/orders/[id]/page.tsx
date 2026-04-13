import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAuthState } from "@/lib/auth";
import { getUserId } from "@/lib/server-auth";
import { CopyKeyButton } from "@/components/orders/CopyKeyButton";
import { formatCents } from "@/lib/format-price";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "Order Detail — Condensation",
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) redirect("/api/auth/login");

  const [userid, { isLoggedIn, userName }] = await Promise.all([
    getUserId(token),
    getAuthState(),
  ]);
  if (!userid) redirect("/api/auth/login");

  let order: Order | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/${id}?userid=${userid}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 404) notFound();
    if (res.ok) {
      const data = await res.json();
      order = data.order ?? null;
    }
  } catch { /* fall through */ }

  if (!order) notFound();

  /* ── Fetch full game detail via backend proxy (price, dev/publisher, metacritic, etc.) ── */
  let game: {
    name: string;
    headerImage: string;
    slug: string;
    priceFinal: number;
    priceInitial: number;
    reductionPercentage: number;
    genres: { id: number; description: string }[];
    releaseDate: string;
    releaseDateRaw: string;
    metacriticScore: number;
    recommendationsTotal: number;
    categories: { id: number; description: string }[];
    companies: { company: { id: number; name: string }; role: string }[];
  } | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/games/${order.gamesId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      game = await res.json();
    }
  } catch { /* game info unavailable — page still works */ }

  /* ── Use order.game for basic info if full game detail is unavailable ── */
  const displayGame = game ?? (order.game ? {
    name: order.game.name,
    headerImage: order.game.headerImage,
    slug: "",
    priceFinal: 0,
    priceInitial: 0,
    reductionPercentage: 0,
    genres: order.game.genres.map((g, i) => ({ id: i, description: g })),
    releaseDate: "",
    releaseDateRaw: "",
    metacriticScore: 0,
    recommendationsTotal: 0,
    categories: [],
    companies: [],
  } : null);

  const developer = displayGame?.companies?.find((c) => c.role === "developer")?.company.name;
  const publisher = displayGame?.companies?.find((c) => c.role === "publisher")?.company.name;

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-headline text-5xl font-black tracking-tight text-on-surface">
            Order #{order.id}
          </h1>
          <div className="mt-3 h-1 w-24 bg-gradient-to-r from-secondary to-transparent" />
        </div>

        {/* ── Game Info Card ── */}
        {displayGame && (
          <div className="mb-8 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container">
            {/* Header image */}
            <div className="relative aspect-[460/215] w-full">
              <Image
                src={displayGame.headerImage}
                alt={displayGame.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
              {displayGame.reductionPercentage > 0 && (
                <span className="absolute right-3 top-3 rounded-lg bg-tertiary px-2.5 py-1 text-xs font-bold text-on-tertiary">
                  -{displayGame.reductionPercentage}%
                </span>
              )}
            </div>

            <div className="space-y-5 p-6">
              {/* Title + Price row */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/games/${displayGame.slug}`}
                    className="font-headline text-2xl font-bold text-on-surface transition-colors hover:text-primary"
                  >
                    {displayGame.name}
                  </Link>

                  {/* Developer / Publisher */}
                  {(developer || publisher) && (
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {developer && <span>{developer}</span>}
                      {developer && publisher && <span className="mx-1.5 text-outline-variant">·</span>}
                      {publisher && <span>{publisher}</span>}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {displayGame.reductionPercentage > 0 && (
                    <span className="block text-xs font-medium text-on-surface-variant line-through">
                      {formatCents(displayGame.priceInitial)}
                    </span>
                  )}
                  <span className="font-headline text-2xl font-black text-secondary">
                    {displayGame.priceFinal === 0 ? "Free" : formatCents(displayGame.priceFinal)}
                  </span>
                </div>
              </div>

              {/* Genres */}
              {displayGame.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {displayGame.genres.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {g.description}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-outline-variant/15 pt-4 text-xs text-on-surface-variant">
                {displayGame.releaseDate && (
                  <div>
                    <span className="font-semibold uppercase tracking-wider text-on-surface-variant/70">Release</span>
                    <p className="mt-0.5 font-medium text-on-surface">{displayGame.releaseDateRaw || displayGame.releaseDate}</p>
                  </div>
                )}
                {displayGame.metacriticScore > 0 && (
                  <div>
                    <span className="font-semibold uppercase tracking-wider text-on-surface-variant/70">Metacritic</span>
                    <p className="mt-0.5 font-medium text-on-surface">{displayGame.metacriticScore}</p>
                  </div>
                )}
                {displayGame.recommendationsTotal > 0 && (
                  <div>
                    <span className="font-semibold uppercase tracking-wider text-on-surface-variant/70">Reviews</span>
                    <p className="mt-0.5 font-medium text-on-surface">{displayGame.recommendationsTotal.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Categories */}
              {displayGame.categories && displayGame.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-outline-variant/15 pt-4">
                  {displayGame.categories.slice(0, 8).map((c) => (
                    <span
                      key={c.id}
                      className="rounded-md bg-surface-container-highest px-2.5 py-1 text-xs text-on-surface-variant"
                    >
                      {c.description}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Key Card ── */}
        <div className="space-y-6 rounded-xl border border-outline-variant/20 bg-surface-container p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary">
                <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Your Game Key
              </h2>
              <p className="text-sm text-on-surface-variant">
                Redeem this key on the platform to activate your game.
              </p>
            </div>
          </div>

          <CopyKeyButton value={order.key} />
        </div>

        {/* ── Navigation ── */}
        <div className="mt-8 flex gap-6">
          <Link
            href="/orders"
            className="text-sm text-on-surface-variant hover:text-on-surface"
          >
            ← Back to all orders
          </Link>
          {displayGame && (
            <Link
              href={`/games/${displayGame.slug}`}
              className="text-sm text-on-surface-variant hover:text-on-surface"
            >
              View game page
            </Link>
          )}
          <Link
            href="/games"
            className="text-sm text-on-surface-variant hover:text-on-surface"
          >
            Browse more games
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
