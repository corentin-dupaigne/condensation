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

  const displayGame = order.game ?? null;

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
            <div className="relative aspect-460/215 w-full">
              <Image
                src={displayGame.headerImage}
                alt={displayGame.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>

            <div className="space-y-4 p-6">
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                {displayGame.name}
              </h2>

              {displayGame.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {displayGame.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {g}
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
