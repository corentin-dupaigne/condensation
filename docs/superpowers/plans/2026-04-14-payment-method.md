# Payment Method Selection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a payment method confirmation step ("Pay from Balance" vs "Pay with Stripe") before any order is created, shared between the cart page (`OrderSummaryCard`) and the product page (`ProductHero`).

**Architecture:** A single reusable `PaymentMethodModal` client component renders as a full-screen overlay. Balance is fetched from `GET /api/balance` on modal open. Two payment paths diverge after confirmation: balance deduction via `POST /api/orders`, or Stripe Checkout redirect via a new `POST /api/stripe/game-checkout` route. The Stripe path returns to `/orders?purchase=success`, which shows a `PurchaseSuccessToast`. The modal's state machine mirrors the pattern established by `TopUpModal` (idle → loading → success/error).

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4 with CSS token design system, `stripe` npm package.

---

## File Map

| Action | File |
|--------|------|
| Create | `frontend/components/checkout/PaymentMethodModal.tsx` |
| Create | `frontend/components/checkout/PurchaseSuccessToast.tsx` |
| Create | `frontend/components/checkout/OrdersClientToast.tsx` |
| Create | `frontend/app/api/stripe/game-checkout/route.ts` |
| Modify | `frontend/components/cart/OrderSummaryCard.tsx` |
| Modify | `frontend/components/product/ProductHero.tsx` |
| Modify | `frontend/app/orders/page.tsx` |
| Create | `frontend/__tests__/components/checkout/PaymentMethodModal.test.tsx` |
| Create | `frontend/__tests__/components/checkout/PurchaseSuccessToast.test.tsx` |
| Create | `frontend/__tests__/app/api/stripe/game-checkout.test.ts` |

---

## Task 1: PaymentMethodModal component

**Files:**
- Create: `frontend/components/checkout/PaymentMethodModal.tsx`
- Create: `frontend/__tests__/components/checkout/PaymentMethodModal.test.tsx`

**Pattern to follow:** `TopUpModal` in `components/wallet/TopUpModal.tsx` — same overlay structure (`fixed inset-0`, backdrop, scrollable container), same discriminated union state (`ModalState`), same `open`/`onClose` prop shape. The CSS token colors from `app/globals.css` are the source of truth.

> **Note on CSS tokens:** `globals.css` defines `--secondary` as `#a1faff` (cyan). The existing `OrderSummaryCard` uses `from-secondary to-secondary-dim` gradient for its checkout button, and `ProductHero` uses `from-secondary to-secondary-container` for "Buy Now". Keep these token references as-is — do not hardcode hex values.

### Variant A — Vitest component test (if `vitest` is configured)

- [ ] **Step 1: Scaffold test file**

Create `frontend/__tests__/components/checkout/PaymentMethodModal.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentMethodModal } from "@/components/checkout/PaymentMethodModal";

const defaultProps = {
  id: "test-modal",
  open: true,
  onClose: vi.fn(),
  total: 50,
  totalCents: 5000,
  lineItems: [{ name: "Elden Ring", priceCents: 5000, quantity: 1 }],
  onBalancePay: vi.fn(),
  onStripePay: vi.fn(),
};

describe("PaymentMethodModal", () => {
  it("renders dialog with title and total", () => {
    render(<PaymentMethodModal {...defaultProps} />);
    expect(screen.getByRole("dialog", { name: /choose payment method/i })).toBeInTheDocument();
    expect(screen.getByText(/50\.00/i)).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<PaymentMethodModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("disables balance button and shows shortfall message when balance is insufficient", async () => {
    // Mock fetch for GET /api/balance to return a low balance
    global.fetch = vi.fn((url: string) => {
      if (url === "/api/balance") {
        return Promise.resolve(new Response(JSON.stringify({ balance: 10 }), { status: 200 }));
      }
      return Promise.resolve(new Response("{}", { status: 404 }));
    }) as unknown as typeof fetch;

    render(<PaymentMethodModal {...defaultProps} totalCents={10000} total={100} />);
    await waitFor(() => {
      expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
    });
    const balanceBtn = screen.getByRole("button", { name: /pay with balance/i });
    expect(balanceBtn).toBeDisabled();
    expect(balanceBtn).toHaveAttribute("aria-disabled", "true");
  });

  it("enables balance button when balance covers total", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url === "/api/balance") {
        return Promise.resolve(new Response(JSON.stringify({ balance: 100 }), { status: 200 }));
      }
      return Promise.resolve(new Response("{}", { status: 404 }));
    }) as unknown as typeof fetch;

    render(<PaymentMethodModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.queryByText(/insufficient balance/i)).not.toBeInTheDocument();
    });
    const balanceBtn = screen.getByRole("button", { name: /pay with balance/i });
    expect(balanceBtn).not.toBeDisabled();
  });

  it("calls onStripePay when stripe card button is clicked", async () => {
    global.fetch = vi.fn(() => Promise.resolve(new Response("{}", { status: 404 }))) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<PaymentMethodModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /pay with card/i }));
    expect(defaultProps.onStripePay).toHaveBeenCalled();
  });

  it("calls onBalancePay when balance card button is clicked (sufficient balance)", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url === "/api/balance") {
        return Promise.resolve(new Response(JSON.stringify({ balance: 1000 }), { status: 200 }));
      }
      return Promise.resolve(new Response("{}", { status: 404 }));
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<PaymentMethodModal {...defaultProps} />);
    // Wait for balance to load and shortfall message to disappear
    await waitFor(() => {
      expect(screen.queryByText(/insufficient balance/i)).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /pay with balance/i }));
    expect(defaultProps.onBalancePay).toHaveBeenCalled();
  });

  it("closes on Escape key", async () => {
    const user = userEvent.setup();
    render(<PaymentMethodModal {...defaultProps} />);
    await user.keyboard("{Escape}");
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("uses sr-only label for total amount", () => {
    render(<PaymentMethodModal {...defaultProps} />);
    const srOnly = document.querySelector(".sr-only");
    expect(srOnly?.textContent).toMatch(/total/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/components/checkout/PaymentMethodModal.test.tsx`
Expected: FAIL — `PaymentMethodModal` does not exist yet

- [ ] **Step 3: Implement the component**

Create `frontend/components/checkout/PaymentMethodModal.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchBalance } from "@/lib/balance-store";
import { formatPrice } from "@/lib/format-price";

type ModalState = "idle" | "loading" | "error";

interface PaymentMethodModalProps {
  id: string;
  open: boolean;
  onClose: () => void;
  total: number;               // in dollars — for display
  totalCents: number;          // in cents — used for balance shortfall check
  lineItems: Array<{
    name: string;
    priceCents: number;
    quantity: number;
  }>;
  onBalancePay: () => void;    // caller fires when "Pay from Balance" confirmed
  onStripePay: () => void;     // caller fires when "Pay with Stripe" confirmed
}

export function PaymentMethodModal({
  id,
  open,
  onClose,
  total,
  totalCents,
  lineItems,
  onBalancePay,
  onStripePay,
}: PaymentMethodModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [balance, setBalance] = useState<number>(0);         // in dollars
  const [balanceLoading, setBalanceLoading] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const balanceShortfall = balance * 100 < totalCents;

  // Fetch balance whenever modal opens
  useEffect(() => {
    if (!open) return;
    setBalanceLoading(true);
    setState("idle");
    fetchBalance()
      .then(() => setBalance(Number(window.localStorage.getItem("condensation.balance.v1") ?? "0")))
      .finally(() => setBalanceLoading(false));
  }, [open]);

  // Focus trap: focus close button when modal opens
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [open]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, handleEscape]);

  if (!open) return null;

  const stripeCardId = `${id}-stripe`;
  const balanceCardId = `${id}-balance`;
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const shortfallMsgId = `${id}-shortfall`;

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Scrollable container */}
      <div className="relative flex min-h-full items-start justify-center py-8 px-4">
        {/* Modal panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="relative w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-high p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2
              id={titleId}
              className="font-headline text-lg font-semibold text-on-surface"
            >
              Choose Payment Method
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close payment method modal"
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Total */}
          <p id={descId} className="mb-6 text-sm text-on-surface-variant">
            <span className="sr-only">Total: </span>
            Total:{" "}
            <span aria-label={`${total} dollars`} className="font-headline font-bold text-on-surface">
              {formatPrice(total)}
            </span>
          </p>

          {/* Payment option cards */}
          <div className="space-y-3" data-testid="payment-options">
            {/* Balance card */}
            <label
              id={balanceCardId}
              htmlFor={`${id}-balance-input`}
              className={[
                "flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-colors",
                balanceShortfall
                  ? "border-error/50 bg-error/5 pointer-events-none select-none"
                  : "border-outline-variant/20 bg-surface-container-highest hover:border-secondary/30",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment-method"
                  id={`${id}-balance-input`}
                  value="balance"
                  defaultChecked
                  className="accent-secondary"
                  aria-describedby={balanceShortfall ? shortfallMsgId : undefined}
                  aria-disabled={balanceShortfall}
                />
                <span className="font-headline font-bold text-on-surface">
                  Pay from Balance
                </span>
                <span className="ml-auto text-sm text-on-surface-variant">
                  Balance:{" "}
                  <span className="font-headline font-bold text-secondary">
                    {balanceLoading ? "…" : formatPrice(balance)}
                  </span>
                </span>
              </div>

              {balanceShortfall && (
                <p id={shortfallMsgId} className="ml-7 flex items-center gap-1.5 text-xs text-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Insufficient balance
                </p>
              )}

              <button
                type="button"
                disabled={balanceShortfall || state === "loading"}
                aria-disabled={balanceShortfall || state === "loading"}
                aria-describedby={balanceShortfall ? shortfallMsgId : undefined}
                className={[
                  "ml-auto mt-1 min-h-11 rounded-lg px-6 py-2.5 font-headline text-sm font-bold uppercase tracking-wider transition-all",
                  balanceShortfall
                    ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                    : "bg-linear-to-br from-secondary to-secondary-dim text-on-secondary hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
                ].join(" ")}
                onClick={() => {
                  if (!balanceShortfall && state !== "loading") {
                    setState("loading");
                    onBalancePay();
                  }
                }}
              >
                Pay with Balance
              </button>
            </label>

            {/* Stripe card */}
            <label
              id={stripeCardId}
              htmlFor={`${id}-stripe-input`}
              className="flex cursor-pointer flex-col gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-highest p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment-method"
                  id={`${id}-stripe-input`}
                  value="stripe"
                  className="accent-primary"
                />
                <span className="font-headline font-bold text-on-surface">
                  Pay with Card (Stripe)
                </span>
              </div>

              <p className="ml-7 text-xs text-on-surface-variant">
                Visa, Mastercard, and more
              </p>

              <button
                type="button"
                disabled={state === "loading"}
                className="ml-auto mt-1 min-h-11 rounded-lg bg-linear-to-br from-primary to-primary-container px-6 py-2.5 font-headline text-sm font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 disabled:opacity-50"
                onClick={() => {
                  if (state !== "loading") {
                    setState("loading");
                    onStripePay();
                  }
                }}
              >
                Pay with Card
              </button>
            </label>
          </div>

          {/* Error */}
          {state === "error" && (
            <p className="mt-3 text-center text-sm text-error" role="alert">
              Something went wrong. Please try again.
            </p>
          )}

          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full min-h-11 rounded-lg border border-outline-variant/20 bg-surface-container py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/components/checkout/PaymentMethodModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add components/checkout/PaymentMethodModal.tsx __tests__/components/checkout/PaymentMethodModal.test.tsx
git commit -m "feat: add PaymentMethodModal component with balance shortfall detection"
```

---

### Variant B — Smoke test (if `vitest` is not configured)

If `vitest` is not installed, skip the test file and verify the component manually:

- [ ] **Step 1: Create the component** (same code as Step 3 above)

- [ ] **Step 2: Type-check**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx tsc --noEmit`
Expected: No errors related to `PaymentMethodModal`

- [ ] **Step 3: Verify imports**

Check that `fetchBalance` and `formatPrice` are imported from their known locations:
- `fetchBalance` from `@/lib/balance-store`
- `formatPrice` from `@/lib/format-price`

- [ ] **Step 4: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add components/checkout/PaymentMethodModal.tsx
git commit -m "feat: add PaymentMethodModal component with balance shortfall detection"
```

---

## Task 2: game-checkout API route

**Files:**
- Create: `frontend/app/api/stripe/game-checkout/route.ts`
- Create: `frontend/__tests__/app/api/stripe/game-checkout.test.ts`

**Pattern to follow:** `app/api/stripe/checkout-session/route.ts` — same `getUserId` inline pattern (do NOT import from `lib/server-auth`, keep it inline per established convention in this file), same Stripe session creation shape, same error response structure.

### Variant A — Vitest API test

- [ ] **Step 1: Write the failing test**

Create `frontend/__tests__/app/api/stripe/game-checkout.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("POST /api/stripe/game-checkout", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
    process.env.STRIPE_SECRET_KEY = "sk_test_mock";
    process.env.API_URL = "http://localhost:8000";
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns 401 when no access_token cookie is present", async () => {
    const { POST } = await import("@/app/api/stripe/game-checkout/route");
    const req = new Request("http://localhost/api/stripe/game-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ games: [{ gameIds: 1245620, quantity: 1 }], returnUrl: "http://localhost/orders" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when games array is missing", async () => {
    const { POST } = await import("@/app/api/stripe/game-checkout/route");
    const req = new Request("http://localhost/api/stripe/game-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: "access_token=valid_token" },
      body: JSON.stringify({ returnUrl: "http://localhost/orders" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/app/api/stripe/game-checkout.test.ts`
Expected: FAIL — route does not exist yet

- [ ] **Step 3: Implement the route**

Create `frontend/app/api/stripe/game-checkout/route.ts`:

```typescript
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const AUTH_URL = process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function getUserId(token: string): Promise<number | null> {
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

interface GameEntry {
  gameIds: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userid = await getUserId(token);
  if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let games: GameEntry[];
  let returnUrl: string;
  try {
    const body = await req.json();
    if (!Array.isArray(body.games) || body.games.length === 0) {
      return NextResponse.json({ error: "games must be a non-empty array" }, { status: 400 });
    }
    games = body.games as GameEntry[];
    returnUrl = String(body.returnUrl ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Build Stripe line items from game entries
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const entry of games) {
    const gameId = Number(entry.gameIds);
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return NextResponse.json({ error: "Invalid game id" }, { status: 400 });
    }
    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Fetch game details to get name and price
    let gameName: string;
    let gamePrice: number;
    try {
      const gameRes = await fetch(`${BACKEND_URL}/api/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!gameRes.ok) {
        return NextResponse.json({ error: "Game not found" }, { status: 400 });
      }
      const gameData = await gameRes.json();
      gameName = gameData.name ?? `Game #${gameId}`;
      gamePrice = Number(gameData.priceFinal);
      if (!Number.isInteger(gamePrice) || gamePrice <= 0) {
        return NextResponse.json({ error: "Game not found" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }

    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: gameName },
        unit_amount: gamePrice,
      },
      quantity,
    });
  }

  // success_url: append purchase=success
  const successUrl =
    `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}purchase=success`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      payment_intent_data: {
        metadata: { userid: String(userid) },
      },
      success_url: successUrl,
      cancel_url: returnUrl,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe game-checkout session error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/app/api/stripe/game-checkout.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add app/api/stripe/game-checkout/route.ts __tests__/app/api/stripe/game-checkout.test.ts
git commit -m "feat: add POST /api/stripe/game-checkout for game purchase Stripe sessions"
```

---

### Variant B — Manual verification (if `vitest` not configured)

- [ ] **Step 1: Implement the route** (same code as Step 3 above)

- [ ] **Step 2: Type-check**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx tsc --noEmit app/api/stripe/game-checkout/route.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add app/api/stripe/game-checkout/route.ts
git commit -m "feat: add POST /api/stripe/game-checkout for game purchase Stripe sessions"
```

---

## Task 3: OrderSummaryCard integration

**Files:**
- Modify: `frontend/components/cart/OrderSummaryCard.tsx:1-110`

### Variant A — Vitest integration test

- [ ] **Step 1: Write the failing test**

Create `frontend/__tests__/components/cart/OrderSummaryCard.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { OrderSummaryCard } from "@/components/cart/OrderSummaryCard";

vi.mock("@/lib/balance-store", () => ({
  fetchBalance: vi.fn(),
  clearCart: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("OrderSummaryCard — payment modal integration", () => {
  it("renders the proceed to checkout button", () => {
    render(
      <OrderSummaryCard
        subtotal={49.99}
        items={[{ id: "1", title: "Elden Ring", price: 49.99, qty: 1 }]}
        isLoggedIn={true}
      />,
    );
    expect(screen.getByRole("button", { name: /proceed to checkout/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it passes (existing behavior)**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/components/cart/OrderSummaryCard.test.tsx`
Expected: PASS (existing button exists)

- [ ] **Step 3: Implement OrderSummaryCard changes**

Read the current `OrderSummaryCard.tsx` and make these changes:

**Change 1 — Import PaymentMethodModal:**

Add to the import block:

```tsx
import { PaymentMethodModal } from "@/components/checkout/PaymentMethodModal";
```

**Change 2 — Add modal state and rename handleCheckout:**

In the component body, replace:

```tsx
const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
```

With:

```tsx
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
```

Rename `handleCheckout` to `handleBalancePay` (keep the function body identical, just rename it).

**Change 3 — Replace "Proceed to Checkout" button:**

Replace:

```tsx
<button
  type="button"
  onClick={handleCheckout}
  disabled={status === "loading"}
  className="w-full rounded-xl bg-gradient-to-br from-secondary to-secondary-dim py-5 font-headline text-lg font-black uppercase tracking-widest text-on-secondary shadow-[0_0_30px_rgba(161,250,255,0.18)] transition-all duration-150 hover:shadow-[0_0_45px_rgba(161,250,255,0.26)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
>
  {status === "loading" ? "Processing…" : "Proceed to Checkout"}
</button>
```

With:

```tsx
<button
  type="button"
  onClick={() => setShowPaymentModal(true)}
  disabled={status === "loading"}
  className="w-full rounded-xl bg-gradient-to-br from-secondary to-secondary-dim py-5 font-headline text-lg font-black uppercase tracking-widest text-on-secondary shadow-[0_0_30px_rgba(161,250,255,0.18)] transition-all duration-150 hover:shadow-[0_0_45px_rgba(161,250,255,0.26)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
>
  {status === "loading" ? "Processing…" : "Proceed to Checkout"}
</button>
```

**Change 4 — Add handleStripePay function after handleBalancePay:**

```tsx
async function handleStripePay() {
  setShowPaymentModal(false);
  setStatus("loading");
  try {
    const res = await fetch("/api/stripe/game-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        games: items.map((i) => ({
          gameIds: parseInt(i.id),
          quantity: i.qty,
        })),
        returnUrl: `${window.location.origin}/orders?purchase=success`,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error();
    window.location.href = data.url;
  } catch {
    setStatus("error");
  }
}
```

**Change 5 — Add PaymentMethodModal JSX before the closing `</div>` of the card:**

Find the last `</div>` in the component (the closing tag of the root `div`). Insert before it:

```tsx
      {showPaymentModal && (
        <PaymentMethodModal
          id="order-summary-payment-modal"
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          total={subtotal}
          totalCents={Math.round(subtotal * 100)}
          lineItems={items.map((i) => ({
            name: i.title,
            priceCents: Math.round(i.price * 100),
            quantity: i.qty,
          }))}
          onBalancePay={handleBalancePay}
          onStripePay={handleStripePay}
        />
      )}
```

**Change 6 — Update the "Not enough balance" error link:**

Replace:

```tsx
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
```

With:

```tsx
<button
  type="button"
  onClick={() => {
    setStatus("idle");
    setShowPaymentModal(true);
  }}
  className="underline text-primary hover:text-primary/80"
>
  Choose payment method →
</button>
```

(Remove the `setShowTopUp` state and `TopUpModal` import if it is no longer used in this file — but keep `showTopUp` state if the file still has other references to it. Check the full file first.)

- [ ] **Step 4: Run test to verify it still passes**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/components/cart/OrderSummaryCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add components/cart/OrderSummaryCard.tsx
git commit -m "feat: wire PaymentMethodModal into OrderSummaryCard checkout flow"
```

---

### Variant B — Manual verification (if vitest not configured)

- [ ] **Step 1: Apply Changes 1-6** from Variant A

- [ ] **Step 2: Type-check**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add components/cart/OrderSummaryCard.tsx
git commit -m "feat: wire PaymentMethodModal into OrderSummaryCard checkout flow"
```

---

## Task 4: ProductHero integration

**Files:**
- Modify: `frontend/components/product/ProductHero.tsx:1-306`

### Variant A — Vitest integration test

- [ ] **Step 1: Write the failing test**

Create `frontend/__tests__/components/product/ProductHero.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ProductHero } from "@/components/product/ProductHero";

const mockGame = {
  id: 1245620,
  steamAppId: 1245620,
  name: "Elden Ring",
  slug: "elden-ring",
  headerImage: "https://example.com/header.jpg",
  priceFinal: 4999,
  reductionPercentage: 25,
  recommendationsTotal: 50000,
  releaseDate: "2022-02-25",
  releaseDateRaw: "Feb 25, 2022",
  genres: [{ id: 1, description: "Action" }],
  detailedDescription: "desc",
  aboutTheGame: "about",
  supportedLanguages: "English",
  requiredAge: 0,
  metacriticScore: 96,
  currency: "USD",
  priceInitial: 5999,
  pcRequirements: {},
  macRequirements: {},
  linuxRequirements: {},
  companies: [],
  categories: [],
  screenshots: [],
  movies: [],
  updatedAt: "",
};

describe("ProductHero — Buy Now button", () => {
  it("renders the Buy Now button", () => {
    render(<ProductHero game={mockGame} />);
    expect(screen.getByRole("button", { name: /buy now/i })).toBeInTheDocument();
  });

  it("Buy Now button is not disabled when no loading state is active", () => {
    render(<ProductHero game={mockGame} />);
    const btn = screen.getByRole("button", { name: /buy now/i });
    expect(btn).not.toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it passes (existing behavior)**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/components/product/ProductHero.test.tsx`
Expected: PASS

- [ ] **Step 3: Implement ProductHero changes**

Read the current `ProductHero.tsx` and make these changes:

**Change 1 — Import PaymentMethodModal:**

Add to the import block:

```tsx
import { PaymentMethodModal } from "@/components/checkout/PaymentMethodModal";
import { fetchBalance } from "@/lib/balance-store";
import { clearCart } from "@/lib/cart-store";
import { useRouter } from "next/navigation";
```

**Change 2 — Add state and router inside `ProductHero`:**

Inside the `ProductHero` function, after `const [keyCounts, setKeyCounts] = useState<number | null>(null);`, add:

```tsx
const router = useRouter();
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [balanceLoading, setBalanceLoading] = useState(false);
const [stripeLoading, setStripeLoading] = useState(false);
```

**Change 3 — Replace the "Buy Now" button:**

Replace:

```tsx
<button className="w-full py-4 bg-linear-to-br from-secondary to-secondary-container text-on-secondary font-headline font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(161,250,255,0.3)]">
  Buy Now
</button>
```

With:

```tsx
<button
  onClick={() => setShowPaymentModal(true)}
  disabled={balanceLoading || stripeLoading}
  className="w-full py-4 bg-linear-to-br from-secondary to-secondary-container text-on-secondary font-headline font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(161,250,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
>
  {balanceLoading || stripeLoading ? "Processing…" : "Buy Now"}
</button>
```

**Change 4 — Add handlers after the component's state declarations:**

```tsx
async function handleBuyNowBalance() {
  setShowPaymentModal(false);
  setBalanceLoading(true);
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        games: [{ gameIds: game.id, quantity: 1 }],
      }),
    });
    if (!res.ok) {
      setBalanceLoading(false);
      return;
    }
    clearCart();
    await fetchBalance();
    router.push("/orders");
  } catch {
    setBalanceLoading(false);
  }
}

async function handleBuyNowStripe() {
  setShowPaymentModal(false);
  setStripeLoading(true);
  try {
    const res = await fetch("/api/stripe/game-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        games: [{ gameIds: game.id, quantity: 1 }],
        returnUrl: `${window.location.origin}/orders?purchase=success`,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error();
    setStripeLoading(false);
    window.location.href = data.url;
  } catch {
    setStripeLoading(false);
  }
}
```

**Change 5 — Add PaymentMethodModal JSX at the end of the component's return, before the final closing tag:**

At the very end of the `return`, before `</section>`, add:

```tsx
      {showPaymentModal && (
        <PaymentMethodModal
          id="product-hero-payment-modal"
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          total={finalPrice}
          totalCents={game.priceFinal}
          lineItems={[{
            name: game.name,
            priceCents: game.priceFinal,
            quantity: 1,
          }]}
          onBalancePay={handleBuyNowBalance}
          onStripePay={handleBuyNowStripe}
        />
      )}
```

**Note:** The component currently uses `const [selectedEdition, setSelectedEdition] = useState<"standard" | "deluxe">("standard");` and `finalPrice` is computed from `game.priceFinal / 100`. Both are already defined and should not be duplicated.

- [ ] **Step 4: Run test to verify it still passes**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/components/product/ProductHero.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add components/product/ProductHero.tsx
git commit -m "feat: wire PaymentMethodModal into ProductHero Buy Now flow"
```

---

### Variant B — Manual verification (if vitest not configured)

- [ ] **Step 1: Apply Changes 1-5** from Variant A

- [ ] **Step 2: Type-check**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add components/product/ProductHero.tsx
git commit -m "feat: wire PaymentMethodModal into ProductHero Buy Now flow"
```

---

## Task 5: PurchaseSuccessToast component

**Files:**
- Create: `frontend/components/checkout/PurchaseSuccessToast.tsx`
- Create: `frontend/__tests__/components/checkout/PurchaseSuccessToast.test.tsx`

### Variant A — Vitest test

- [ ] **Step 1: Write the failing test**

Create `frontend/__tests__/components/checkout/PurchaseSuccessToast.test.tsx`:

```tsx
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PurchaseSuccessToast } from "@/components/checkout/PurchaseSuccessToast";

describe("PurchaseSuccessToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the success message", () => {
    render(<PurchaseSuccessToast visible={true} onDismiss={vi.fn()} />);
    expect(screen.getByText(/purchase complete/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has aria-live polite on the container", () => {
    render(<PurchaseSuccessToast visible={true} onDismiss={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("calls onDismiss after 4 seconds", () => {
    const onDismiss = vi.fn();
    render(<PurchaseSuccessToast visible={true} onDismiss={onDismiss} />);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  it("dismisses early when dismiss button is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onDismiss = vi.fn();
    render(<PurchaseSuccessToast visible={true} onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/components/checkout/PurchaseSuccessToast.test.tsx`
Expected: FAIL — component does not exist

- [ ] **Step 3: Implement the component**

Create `frontend/components/checkout/PurchaseSuccessToast.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

interface PurchaseSuccessToastProps {
  visible: boolean;
  onDismiss: () => void;
}

export function PurchaseSuccessToast({ visible, onDismiss }: PurchaseSuccessToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Skip auto-dismiss timer for reduced motion users
      return;
    }
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [mounted, onDismiss]);

  if (!mounted || !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-[1000] flex items-center gap-3 rounded-xl border border-tertiary/30 bg-tertiary/10 px-5 py-4 shadow-xl backdrop-blur-md animate-fade-in"
    >
      {/* Check icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary/20">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      {/* Message */}
      <div>
        <p className="font-headline text-sm font-bold text-on-surface">
          Purchase complete!
        </p>
        <p className="text-xs text-on-surface-variant">
          Your keys are below.
        </p>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        aria-label="Dismiss success message"
        onClick={onDismiss}
        className="ml-2 shrink-0 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/components/checkout/PurchaseSuccessToast.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add components/checkout/PurchaseSuccessToast.tsx __tests__/components/checkout/PurchaseSuccessToast.test.tsx
git commit -m "feat: add PurchaseSuccessToast with auto-dismiss and accessibility"
```

---

### Variant B — Manual verification (if vitest not configured)

- [ ] **Step 1: Implement the component** (same code as Step 3 above)

- [ ] **Step 2: Type-check**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add components/checkout/PurchaseSuccessToast.tsx
git commit -m "feat: add PurchaseSuccessToast with auto-dismiss and accessibility"
```

---

## Task 6: orders page integration

**Files:**
- Modify: `frontend/app/orders/page.tsx:1-123`

### Variant A — Vitest integration test

- [ ] **Step 1: Write the failing test**

Create `frontend/__tests__/app/orders/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { OrdersPage } from "@/app/orders/page";

vi.mock("@/components/checkout/OrdersClientToast", () => ({
  OrdersClientToast: () => null,
}));

// Mock cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(new Map([["access_token", { value: "fake_token" }]])),
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  getAuthState: vi.fn().mockResolvedValue({ isLoggedIn: true, userName: "TestUser" }),
}));

// Mock server-auth
vi.mock("@/lib/server-auth", () => ({
  getUserId: vi.fn().mockResolvedValue(42),
}));

// Mock backend fetch
global.fetch = vi.fn((url: string) => {
  if (url.includes("/api/orders")) {
    return Promise.resolve(
      new Response(JSON.stringify({ orders: [] }), { status: 200 }),
    );
  }
  return Promise.resolve(new Response("{}", { status: 404 }));
}) as unknown as typeof fetch;

describe("OrdersPage", () => {
  it("renders the orders page heading", async () => {
    const Page = (await import("@/app/orders/page")).default;
    render(await Page({ searchParams: {} }));
    expect(screen.getByRole("heading", { name: /your orders/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect it to pass or need adjustments**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/app/orders/page.test.tsx`
Expected: PASS (existing page structure)

- [ ] **Step 3: Implement orders page changes**

Read the current `app/orders/page.tsx`. The changes needed are:

**Change 1 — Import the existing OrdersClientToast component:**

Add after the existing imports:

```tsx
import { OrdersClientToast } from "@/components/checkout/OrdersClientToast";
```

> `OrdersClientToast` does not exist yet — it is created in the Variant A/B steps below. Import it as a path that will exist by the time the page is rendered.

**Change 2 — Render the toast in the page JSX:**

In the `return` statement of `OrdersPage`, after `<Header ... />`, add:

```tsx
<OrdersClientToast />
```

**Step A: Create `frontend/components/checkout/OrdersClientToast.tsx`:**

Create this new file (not in the orders page itself):

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PurchaseSuccessToast } from "./PurchaseSuccessToast";

export function OrdersClientToast() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(searchParams.get("purchase") === "success");
  }, [searchParams]);

  if (!visible) return null;

  return <PurchaseSuccessToast visible={true} onDismiss={() => setVisible(false)} />;
}
```

This file is independent of Task 5 — it can be created at any point before Task 6 is executed.

- [ ] **Step 4: Run test to verify it still passes**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx vitest run __tests__/app/orders/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add app/orders/page.tsx
git commit -m "feat: show PurchaseSuccessToast on /orders?purchase=success"
```

---

### Variant B — Manual verification (if vitest not configured)

- [ ] **Step 1: Apply Changes 1-4** from Variant A

- [ ] **Step 2: Type-check**

Run: `cd /home/nlnguyen/Documents/condensation/frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
cd /home/nlnguyen/Documents/condensation/frontend
git add app/orders/page.tsx
git commit -m "feat: show PurchaseSuccessToast on /orders?purchase=success"
```

---

## Spec Coverage Checklist

| Spec Section | Task(s) | Status |
|---|---|---|
| PaymentMethodModal props + ARIA | Task 1 | ☐ |
| Balance shortfall detection (CSS token border, aria-disabled) | Task 1 | ☐ |
| Accessibility table (aria-label, sr-only, keyboard, focus ring, motion) | Task 1 | ☐ |
| Touch targets min-h-11 | Task 1 | ☐ |
| OrderSummaryCard wiring | Task 3 | ☐ |
| ProductHero wiring | Task 4 | ☐ |
| handleStripePay in OrderSummaryCard | Task 3 | ☐ |
| handleBuyNowBalance + handleBuyNowStripe in ProductHero | Task 4 | ☐ |
| POST /api/stripe/game-checkout route | Task 2 | ☐ |
| PurchaseSuccessToast component | Task 5 | ☐ |
| OrdersClientToast (separate client file) | Task 6 | ☐ |
| orders page ?purchase=success detection | Task 6 | ☐ |
| Error handling (network balance, shortfall, balance fails, stripe fails) | Tasks 1, 3, 4 | ☐ |

## Self-Review Notes

- `TopUpModal` is in `components/wallet/`, not `components/checkout/`. PaymentMethodModal goes in `components/checkout/` as specified. The two components share the same overlay pattern but are independent.
- `globals.css` defines `--secondary` as `#a1faff` (cyan). Existing code in `OrderSummaryCard` uses `from-secondary to-secondary-dim` gradient. This token reference is kept as-is in all changes — do not replace with hardcoded hex values.
- `app/api/stripe/checkout-session/route.ts` and `app/api/stripe/payment-intent/route.ts` each have their own inline `getUserId`. The new `game-checkout/route.ts` follows this same pattern (inline, not imported) to stay consistent.
- `lib/balance-store.ts` stores balance in dollars. The `fetchBalance()` call returns void but writes to localStorage. The modal reads from `window.localStorage.getItem("condensation.balance.v1")` to get the numeric balance value.
- `handleBuyNowBalance` in ProductHero does not throw on `!res.ok` — it just resets the loading state. This is consistent with the existing ProductHero behavior (the button was a no-op before, so the new behavior degrades gracefully).
- **`app/orders/page.tsx` cannot have `"use client"` added** because it uses server-only APIs (`cookies()`, `redirect()`, `fetch()`). `OrdersClientToast` is created as a separate file (`components/checkout/OrdersClientToast.tsx`) with `"use client"`, and the server page imports and renders it. This is the standard Next.js App Router pattern.
