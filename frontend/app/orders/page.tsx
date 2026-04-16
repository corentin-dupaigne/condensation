import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrdersClientToast } from "@/components/checkout/OrdersClientToast";
import { getAuthState } from "@/lib/auth";
import { getUserId } from "@/lib/server-auth";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your Orders — Condensation",
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) redirect("/api/auth/login");

  const [userid, { isLoggedIn, userName }] = await Promise.all([
    getUserId(token),
    getAuthState(),
  ]);
  if (!userid) redirect("/api/auth/login");

  let orders: Order[] = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/orders?userid=${userid}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      orders = data.orders ?? [];
    }
  } catch { /* render empty state */ }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <OrdersClientToast />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-headline text-5xl font-black tracking-tight text-on-surface">
            Your Orders
          </h1>
          <div className="mt-3 h-1 w-24 bg-gradient-to-r from-secondary to-transparent" />
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-12 text-center">
            <p className="text-on-surface-variant">You have no orders yet.</p>
            <Link
              href="/games"
              className="mt-4 inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            >
              Browse games
            </Link>
          </div>
        ) : (
          <>
          <div className="hidden md:grid grid-cols-[3rem_1fr_1fr_auto] gap-x-4 rounded-t-xl border border-outline-variant/20 bg-surface-container px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            <span>Order</span>
            <span>Game</span>
            <span>Key Preview</span>
            <span />
          </div>
          <div className="rounded-xl md:rounded-t-none border border-outline-variant/20 md:border-t-0 bg-surface-container">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-1 gap-2 border-b border-outline-variant/10 px-6 py-4 last:border-b-0 md:grid-cols-[3rem_1fr_1fr_auto] md:items-center md:gap-x-4"
              >
                <span className="text-sm font-medium text-on-surface">
                  #{order.id}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  {order.game?.headerImage && (
                    <div className="relative h-9 w-16 shrink-0 overflow-hidden rounded">
                      <Image
                        src={order.game.headerImage}
                        alt={order.game.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <span className="truncate text-sm font-medium text-on-surface">
                    {order.game?.name ?? "—"}
                  </span>
                </div>
                <span className="font-mono text-sm text-on-surface-variant md:self-center">
                  {order.key.split("-")[0]}-···
                </span>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
                >
                  View key →
                </Link>
              </div>
            ))}
          </div>
          </>
        )}

        <div className="mt-8">
          <Link
            href="/games"
            className="text-sm text-on-surface-variant hover:text-on-surface"
          >
            ← Browse more games
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
