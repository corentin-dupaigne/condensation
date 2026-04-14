# Order Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the cart checkout button to the backend `/orders` API, redirect to a live order list page on success, and replace mock order data in the Profile page with real data.

**Architecture:** Client-side fetch from `OrderSummaryCard` → Next.js API proxy routes (following the `balance/route.ts` pattern) → Spring Boot backend. Server components for `/orders` and `/orders/[id]` fetch directly from the backend using cookies. `lib/server-auth.ts` centralises the `getUserId` helper used by all server-side code.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Bun, Tailwind CSS v4, Spring Boot backend at `BACKEND_URL`, Laravel auth at `AUTH_URL`.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/types.ts` | Modify | Add `Order` interface |
| `lib/server-auth.ts` | **Create** | Shared `getUserId` helper for all server-side code |
| `app/api/balance/route.ts` | Modify | Use `getUserId` from `lib/server-auth.ts` (remove inline copy) |
| `app/api/orders/route.ts` | **Create** | GET list + POST create proxy |
| `app/api/orders/[id]/route.ts` | **Create** | GET single order proxy |
| `components/cart/OrderSummaryCard.tsx` | Modify | Add checkout state, POST call, error + TopUpModal |
| `components/cart/CartPageClient.tsx` | Modify | Pass `items` prop to `OrderSummaryCard` |
| `components/orders/CopyKeyButton.tsx` | **Create** | Client component: copy-to-clipboard for a key string |
| `app/orders/page.tsx` | **Create** | Server component: full order list page |
| `app/orders/[id]/page.tsx` | **Create** | Server component: single order key detail page |
| `components/profile/ProfileClient.tsx` | Modify | Replace `mockRecentOrders` with live `GET /api/orders` |

---

## Task 1: Add `Order` type and extract `getUserId` helper

**Files:**
- Modify: `lib/types.ts`
- Create: `lib/server-auth.ts`
- Modify: `app/api/balance/route.ts`

- [ ] **Step 1: Add `Order` to `lib/types.ts`**

  Append after the last export in the file:

  ```ts
  export interface Order {
    id: number;
    user_id: number;
    games_id: number;
    key: string;
  }
  ```

- [ ] **Step 2: Create `lib/server-auth.ts`**

  ```ts
  const AUTH_URL = process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";

  export async function getUserId(token: string): Promise<number | null> {
    try {
      const res = await fetch(`${AUTH_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const user = await res.json();
      return typeof user.id === "number" ? user.id : null;
    } catch {
      return null;
    }
  }
  ```

- [ ] **Step 3: Update `app/api/balance/route.ts` to use the shared helper**

  Replace the file content:

  ```ts
  import { cookies } from "next/headers";
  import { NextResponse } from "next/server";
  import { getUserId } from "@/lib/server-auth";

  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

  export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userid = await getUserId(token);
    if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const res = await fetch(`${BACKEND_URL}/api/balance?userid=${userid}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return NextResponse.json({ error: "Backend error" }, { status: 502 });
      const data = await res.json();
      return NextResponse.json({ balance: data.balance });
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }
  }
  ```

- [ ] **Step 4: Verify the balance feature still works**

  Run: `bun dev`

  Open `http://localhost:3000` while logged in and confirm the balance still appears in the header (no regression).

- [ ] **Step 5: Commit**

  ```bash
  git add lib/types.ts lib/server-auth.ts app/api/balance/route.ts
  git commit -m "feat: add Order type and extract getUserId to shared server-auth helper"
  ```

---

## Task 2: Create orders API proxy routes

**Files:**
- Create: `app/api/orders/route.ts`
- Create: `app/api/orders/[id]/route.ts`

- [ ] **Step 1: Create `app/api/orders/route.ts`**

  ```ts
  import { cookies } from "next/headers";
  import { NextResponse } from "next/server";
  import { getUserId } from "@/lib/server-auth";

  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

  export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userid = await getUserId(token);
    if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders?userid=${userid}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return NextResponse.json({ error: "Backend error" }, { status: 502 });
      return NextResponse.json(await res.json());
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }
  }

  export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userid = await getUserId(token);
    if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { games } = await request.json();
      const res = await fetch(`${BACKEND_URL}/api/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userid, games }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }
  }
  ```

- [ ] **Step 2: Create `app/api/orders/[id]/route.ts`**

  ```ts
  import { cookies } from "next/headers";
  import { NextResponse } from "next/server";
  import { getUserId } from "@/lib/server-auth";

  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

  export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userid = await getUserId(token);
    if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${id}?userid=${userid}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: res.status });
      return NextResponse.json(await res.json());
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }
  }
  ```

- [ ] **Step 3: Verify routes respond correctly**

  With the dev server running and the backend up, open a browser DevTools console while logged in and run:

  ```js
  fetch('/api/orders').then(r => r.json()).then(console.log)
  ```

  Expected: `{ orders: [...] }` (may be empty array if no orders yet) — not a 401 or 502.

- [ ] **Step 4: Commit**

  ```bash
  git add app/api/orders/route.ts app/api/orders/[id]/route.ts
  git commit -m "feat: add orders API proxy routes (GET list, POST create, GET by id)"
  ```

---

## Task 3: Wire checkout flow in `CartPageClient` and `OrderSummaryCard`

**Files:**
- Modify: `components/cart/CartPageClient.tsx`
- Modify: `components/cart/OrderSummaryCard.tsx`

- [ ] **Step 1: Update `components/cart/CartPageClient.tsx` to pass `items` to `OrderSummaryCard`**

  Replace the file content:

  ```tsx
  "use client";

  import { GameCard } from "@/components/shared/GameCard";
  import { CartItemRow } from "@/components/cart/CartItemRow";
  import { EmptyCartState } from "@/components/cart/EmptyCartState";
  import { OrderSummaryCard } from "@/components/cart/OrderSummaryCard";
  import { clearCart, getCartSubtotal, useCartState } from "@/lib/cart-store";
  import type { Game } from "@/lib/types";

  export function CartPageClient({ recommendedGames }: { recommendedGames: Game[] }) {
    const cart = useCartState();

    const itemCount = cart.items.reduce((sum, it) => sum + it.qty, 0);
    const subtotal = getCartSubtotal(cart);

    if (cart.items.length === 0) return <EmptyCartState />;

    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-headline text-5xl font-black tracking-tight text-on-surface">
            Your Shopping Cart{" "}
            <span className="font-headline text-2xl font-light italic text-secondary/60">
              ({itemCount} item{itemCount === 1 ? "" : "s"})
            </span>
          </h1>
          <div className="mt-3 h-1 w-24 bg-gradient-to-r from-secondary to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-10">
          <div className="space-y-10 lg:col-span-7">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-4">
              <p className="text-sm text-on-surface-variant">
                Need a fresh start? Clear everything and rebuild your order.
              </p>
              <button
                type="button"
                className="h-11 rounded-xl bg-surface-container-highest px-4 font-headline text-sm font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-bright"
                onClick={() => clearCart()}
              >
                Clear cart
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <OrderSummaryCard subtotal={subtotal} items={cart.items} />
          </div>
        </div>

        <section className="mt-24 space-y-8">
          <div className="flex items-baseline gap-4">
            <h2 className="font-headline text-3xl font-black tracking-tight uppercase text-on-surface">
              Complete Your Order
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-outline-variant/30 to-transparent" />
          </div>

          <div className="custom-scrollbar flex gap-6 overflow-x-auto pb-6">
            {recommendedGames.map((g) => (
              <GameCard key={g.slug} game={g} className="w-[280px]" />
            ))}
          </div>
        </section>
      </div>
    );
  }
  ```

- [ ] **Step 2: Replace `components/cart/OrderSummaryCard.tsx` with checkout logic**

  ```tsx
  "use client";

  import { useState } from "react";
  import { useRouter } from "next/navigation";
  import { formatPrice } from "@/lib/format-price";
  import { clearCart } from "@/lib/cart-store";
  import { fetchBalance } from "@/lib/balance-store";
  import { TopUpModal } from "@/components/wallet/TopUpModal";
  import type { CartItem } from "@/lib/cart-store";

  export function OrderSummaryCard({
    subtotal,
    items,
  }: {
    subtotal: number;
    items: CartItem[];
  }) {
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [showTopUp, setShowTopUp] = useState(false);

    async function handleCheckout() {
      setStatus("loading");
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            games: items.map((i) => ({ gameIds: parseInt(i.id), quantity: i.qty })),
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setStatus("error");
          return;
        }
        clearCart();
        await fetchBalance();
        router.push("/orders");
      } catch {
        setStatus("error");
      }
    }

    return (
      <div className="sticky top-24 rounded-xl border border-outline-variant/20 p-8 shadow-2xl glass-panel space-y-8">
        <h2 className="border-b border-outline-variant/20 pb-4 font-headline text-xl font-bold uppercase tracking-widest">
          Order Summary
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>Subtotal</span>
            <span className="font-headline font-bold text-on-surface">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>

        <div className="border-t border-outline-variant/20 pt-6">
          <div className="mb-8 flex items-baseline justify-between">
            <span className="font-headline text-lg font-bold uppercase tracking-widest">
              Total
            </span>
            <div className="text-right">
              <span className="block font-headline text-4xl font-black text-secondary">
                {formatPrice(subtotal)}
              </span>
              <span className="text-[10px] uppercase tracking-tight text-on-surface-variant">
                VAT included where applicable
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={status === "loading"}
            className="w-full rounded-xl bg-gradient-to-br from-secondary to-secondary-dim py-5 font-headline text-lg font-black uppercase tracking-widest text-on-secondary shadow-[0_0_30px_rgba(161,250,255,0.18)] transition-all duration-150 hover:shadow-[0_0_45px_rgba(161,250,255,0.26)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Processing…" : "Proceed to Checkout"}
          </button>

          {status === "error" && (
            <p className="mt-3 text-center text-sm text-error">
              Not enough balance.{" "}
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setShowTopUp(true);
                }}
                className="underline text-primary hover:text-primary/80"
              >
                Top up your wallet →
              </button>
            </p>
          )}
        </div>

        <TopUpModal open={showTopUp} onClose={() => setShowTopUp(false)} />
      </div>
    );
  }
  ```

- [ ] **Step 3: Verify checkout flow manually**

  Run `bun dev`. Add a game to the cart and go to `/cart`.

  - Confirm "Proceed to Checkout" button is visible and not disabled.
  - Click it while logged out → should fail gracefully (proxy returns 401, button shows error state).
  - Click it while logged in with insufficient balance → error message + "Top up your wallet →" link appear, clicking the link opens the TopUpModal.

- [ ] **Step 4: Commit**

  ```bash
  git add components/cart/CartPageClient.tsx components/cart/OrderSummaryCard.tsx
  git commit -m "feat: wire checkout button — POST to /api/orders with loading/error states"
  ```

---

## Task 4: Create the Orders list page (`/orders`)

**Files:**
- Create: `app/orders/page.tsx`

- [ ] **Step 1: Create `app/orders/page.tsx`**

  ```tsx
  import { cookies } from "next/headers";
  import { redirect } from "next/navigation";
  import Link from "next/link";
  import type { Metadata } from "next";
  import { Header } from "@/components/layout/Header";
  import { Footer } from "@/components/layout/Footer";
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
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container">
              <div className="hidden grid-cols-[auto_1fr_auto] gap-4 border-b border-outline-variant/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant md:grid">
                <span>Order</span>
                <span>Key Preview</span>
                <span />
              </div>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-1 gap-2 border-b border-outline-variant/10 px-6 py-4 last:border-b-0 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4"
                >
                  <span className="text-sm font-medium text-on-surface">
                    #{order.id}
                  </span>
                  <span className="font-mono text-sm text-on-surface-variant">
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
  ```

- [ ] **Step 2: Verify the orders list page**

  Navigate to `http://localhost:3000/orders` while logged in.

  - With no orders: empty state with "Browse games" link renders.
  - With existing orders: table rows show `#id`, key preview, and "View key →" link.
  - While logged out: redirected to `/api/auth/login`.

- [ ] **Step 3: Commit**

  ```bash
  git add app/orders/page.tsx
  git commit -m "feat: add /orders page — server-rendered order list with auth gate"
  ```

---

## Task 5: Create the Order detail page (`/orders/[id]`)

**Files:**
- Create: `components/orders/CopyKeyButton.tsx`
- Create: `app/orders/[id]/page.tsx`

- [ ] **Step 1: Create `components/orders/CopyKeyButton.tsx`**

  ```tsx
  "use client";

  import { useState } from "react";

  export function CopyKeyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    return (
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-highest p-4">
        <code className="flex-1 font-mono text-lg font-bold tracking-widest text-on-surface break-all">
          {value}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    );
  }
  ```

- [ ] **Step 2: Create `app/orders/[id]/page.tsx`**

  ```tsx
  import { cookies } from "next/headers";
  import { redirect, notFound } from "next/navigation";
  import Link from "next/link";
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

    return (
      <>
        <Header isLoggedIn={isLoggedIn} userName={userName} />
        <main className="mx-auto max-w-2xl px-6 py-12">
          <div className="mb-10">
            <h1 className="font-headline text-5xl font-black tracking-tight text-on-surface">
              Order #{order.id}
            </h1>
            <div className="mt-3 h-1 w-24 bg-gradient-to-r from-secondary to-transparent" />
          </div>

          <div className="space-y-6 rounded-xl border border-outline-variant/20 bg-surface-container p-8">
            <p className="text-on-surface-variant">
              Your key has been delivered. Redeem it on the platform.
            </p>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                Game Key
              </p>
              <CopyKeyButton value={order.key} />
            </div>
          </div>

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
  ```

- [ ] **Step 3: Verify the order detail page**

  If you have an existing order with a known ID, navigate to `http://localhost:3000/orders/1` (replace `1` with the real ID).

  - Key renders in the styled code block.
  - "Copy" button copies the key to clipboard and briefly shows "Copied!".
  - "Back to all orders" → `/orders`, "Browse more games" → `/games`.
  - Navigating to a non-existent order ID renders the Next.js 404 page.

- [ ] **Step 4: Commit**

  ```bash
  git add components/orders/CopyKeyButton.tsx app/orders/[id]/page.tsx
  git commit -m "feat: add /orders/[id] detail page with copyable key display"
  ```

---

## Task 6: End-to-end checkout test

- [ ] **Step 1: Full checkout flow test**

  With `bun dev` running and the backend + Kafka up (`docker compose up -d`):

  1. Log in.
  2. Add a game to the cart.
  3. Go to `/cart`.
  4. Click "Proceed to Checkout".
  5. Expected: button shows "Processing…", then the cart clears, the balance in the header updates, and the browser navigates to `/orders`.
  6. On `/orders`: your new order(s) appear at the top of the list.
  7. Click "View key →" on any row → `/orders/[id]` shows the full key.
  8. Click "Copy" → key is now in the clipboard.

- [ ] **Step 2: Insufficient balance test**

  Reduce your balance below the cart total (or use a large cart):

  1. Click "Proceed to Checkout".
  2. Expected: button resets, inline error message appears: "Not enough balance. Top up your wallet →"
  3. Click the link → TopUpModal opens.

---

## Task 7: Wire Profile Order History with live data

**Files:**
- Modify: `components/profile/ProfileClient.tsx`

- [ ] **Step 1: Replace `ProfileClient.tsx` with live-data version**

  Replace the file content:

  ```tsx
  "use client";

  import { useState, useEffect } from "react";
  import Link from "next/link";
  import type { Order } from "@/lib/types";

  const tabs = ["Overview", "Badges", "Order History"] as const;
  type Tab = (typeof tabs)[number];

  const mockBadges = [
    {
      id: "early-adopter",
      name: "Early Adopter",
      description: "Joined during the first month of Condensation",
      icon: "🛡️",
      earnedAt: "2024-12-15",
    },
    {
      id: "first-purchase",
      name: "First Purchase",
      description: "Completed your first key purchase",
      icon: "🎮",
      earnedAt: "2024-12-20",
    },
    {
      id: "collector",
      name: "Collector",
      description: "Purchased 10 or more game keys",
      icon: "🏆",
      earnedAt: "2025-01-10",
    },
  ];

  export function ProfileClient({ userName }: { userName: string | null }) {
    const [activeTab, setActiveTab] = useState<Tab>("Overview");
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
      fetch("/api/orders")
        .then((r) => (r.ok ? r.json() : { orders: [] }))
        .then((data) => setOrders(data.orders ?? []))
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }, []);

    const initials = userName ? userName.charAt(0).toUpperCase() : "P";
    const memberSince = "December 2024";

    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-outline-variant/20 bg-surface-container-high p-8 md:flex-row md:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-2xl font-bold text-on-primary">
            {initials}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              {userName || "Player"}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Member since {memberSince}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {mockBadges.length} Badges
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {ordersLoading ? "…" : orders.length} Orders
              </span>
            </div>
          </div>
          <Link
            href="/settings"
            className="shrink-0 rounded-lg border border-outline-variant/30 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface"
          >
            Edit Profile
          </Link>
        </div>

        {/* Steam Integration Card */}
        <div className="mt-6 rounded-xl border border-outline-variant/20 bg-surface-container-high p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface">Steam Account</h3>
                <p className="text-xs text-on-surface-variant">
                  Not linked — connect your Steam account for personalized recommendations
                </p>
              </div>
            </div>
            <button className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
              Link Steam
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 border-b border-outline-variant/20">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "Overview" && (
            <OverviewTab badges={mockBadges} orders={orders} ordersLoading={ordersLoading} />
          )}
          {activeTab === "Badges" && <BadgesTab badges={mockBadges} />}
          {activeTab === "Order History" && (
            <OrderHistoryTab orders={orders} loading={ordersLoading} />
          )}
        </div>
      </div>
    );
  }

  function OverviewTab({
    badges,
    orders,
    ordersLoading,
  }: {
    badges: typeof mockBadges;
    orders: Order[];
    ordersLoading: boolean;
  }) {
    const recentOrders = orders.slice(0, 3);

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Badges */}
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-6">
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Recent Badges
          </h2>
          <div className="mt-4 space-y-3">
            {badges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">{badge.name}</p>
                  <p className="text-xs text-on-surface-variant">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-6">
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Recent Orders
          </h2>
          <div className="mt-4 space-y-3">
            {ordersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-surface-container-high animate-pulse" />
              ))
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
                >
                  <div>
                    <p className="text-sm font-medium text-on-surface">Order #{order.id}</p>
                    <p className="font-mono text-xs text-on-surface-variant">
                      {order.key.split("-")[0]}-···
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View key
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommendations Placeholder */}
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-6 md:col-span-2">
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Recommended For You
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Link your Steam account to get personalized game recommendations based on your library and play history.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-lg bg-surface-container-high animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  function BadgesTab({ badges }: { badges: typeof mockBadges }) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 transition-colors hover:bg-surface-container-high"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{badge.icon}</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-on-surface">{badge.name}</h3>
                <p className="mt-1 text-xs text-on-surface-variant">{badge.description}</p>
                <p className="mt-2 text-xs text-on-surface-variant/60">
                  Earned on{" "}
                  {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {[
          { name: "Veteran", description: "Be a member for 1 year", icon: "🎖️" },
          { name: "Big Spender", description: "Spend $500 or more on game keys", icon: "💎" },
          { name: "Reseller", description: "Complete your first peer-to-peer sale", icon: "🤝" },
        ].map((badge) => (
          <div
            key={badge.name}
            className="rounded-xl border border-outline-variant/10 bg-surface-container/50 p-5 opacity-50"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl grayscale">{badge.icon}</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-on-surface-variant">{badge.name}</h3>
                <p className="mt-1 text-xs text-on-surface-variant/60">{badge.description}</p>
                <p className="mt-2 text-xs text-primary/60">Locked</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function OrderHistoryTab({
    orders,
    loading,
  }: {
    orders: Order[];
    loading: boolean;
  }) {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-surface-container animate-pulse" />
          ))}
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-12 text-center">
          <p className="text-on-surface-variant">No orders yet.</p>
          <Link
            href="/games"
            className="mt-4 inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
          >
            Browse games
          </Link>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container">
        <div className="hidden grid-cols-[auto_1fr_auto] gap-4 border-b border-outline-variant/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant md:grid">
          <span>Order</span>
          <span>Key Preview</span>
          <span />
        </div>
        {orders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-1 gap-2 border-b border-outline-variant/10 px-6 py-4 last:border-b-0 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4"
          >
            <span className="text-sm font-medium text-on-surface">#{order.id}</span>
            <span className="font-mono text-sm text-on-surface-variant">
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
    );
  }
  ```

- [ ] **Step 2: Verify Profile Order History**

  Navigate to `http://localhost:3000/profile` while logged in.

  - While loading: skeleton rows appear in the Order History tab and "Recent Orders" section.
  - After load: real orders appear (or "No orders yet." if none exist).
  - Order count badge in the profile header updates to the real count.
  - Clicking "View key →" navigates to `/orders/[id]`.

- [ ] **Step 3: Commit**

  ```bash
  git add components/profile/ProfileClient.tsx
  git commit -m "feat: replace mock orders in ProfileClient with live data from /api/orders"
  ```

---

## Self-Review Notes

- **`gameIds` field name:** The Java `OrderRequest` record uses `gameIds` (camelCase). Jackson defaults to camelCase. The POST body in Task 3 Step 2 correctly uses `gameIds`. ✓
- **POST response error detection:** The backend may return HTTP 200 with `{ error: "..." }` in the body. The checkout handler checks both `!res.ok` and `data.error`. ✓
- **Multiple orders per checkout:** After POST, the redirect goes to `/orders` (full list), not `/orders/[id]`. All created orders appear there. ✓
- **`getUserId` deduplication:** `lib/server-auth.ts` is used by both the API routes and the server components. `balance/route.ts` is updated to use it too. ✓
- **Auth on new pages:** Both `/orders` and `/orders/[id]` redirect unauthenticated users to `/api/auth/login`. ✓
- **`notFound()` on missing order:** `app/orders/[id]/page.tsx` calls `notFound()` on 404 from backend. ✓
