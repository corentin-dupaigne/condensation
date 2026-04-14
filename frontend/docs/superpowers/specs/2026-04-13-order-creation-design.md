# Order Creation — Design Spec

**Date:** 2026-04-13  
**Project:** Condensation (fullstack_project/frontend)  
**Scope:** Checkout flow, order list page, order detail page, and live Order History in Profile

---

## Overview

Wire up the existing "Proceed to Checkout" button in the cart to the backend `/orders` API. On success, redirect to `/orders` — a new page listing all the user's orders. Individual keys are accessible via `/orders/[id]`. Also replace mock data in the Profile Order History tab with live data from `GET /orders`.

---

## API Endpoints (backend)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/orders` | Create orders: `{ userid, games: [{ gameIds, quantity }] }` |
| `GET` | `/orders?userid=` | List all orders for user |
| `GET` | `/orders/{id}?userid=` | Get single order with key |

**POST behavior (verified from source):**
- Creates one `Order` record per game × quantity (e.g. 2 games → 2 records, 1 game × qty 3 → 3 records)
- Success response: `{ "message": "Commande effectuée avec succès" }` — no order IDs returned
- Error response: `{ "error": "insufficient_balance", "message": string }` (thrown as `IllegalStateException`, handled by controller)

**POST request body field name:** `gameIds` (camelCase) — the `OrderRequest` Java record uses `gameIds`, not `game_ids`. Jackson serializes to camelCase by default.

**Order shape:**
```ts
{ id: number; user_id: number; games_id: number; key: string }
```

---

## Architecture

### Approach: Client fetch + Next.js API proxy routes

Follows the existing pattern established in `app/api/balance/route.ts`: read `access_token` cookie → resolve `userid` from auth service → proxy request to backend.

### New type in `lib/types.ts`

```ts
export interface Order {
  id: number;
  user_id: number;
  games_id: number;
  key: string;
}
```

---

## Section 1: Next.js API Proxy Routes

### `app/api/orders/route.ts`

- **GET** — resolve userid, call `GET {BACKEND_URL}/api/orders?userid={id}`, return `{ orders: Order[] }`
- **POST** — resolve userid, read request body `{ games: Array<{ gameIds, quantity }> }`, forward to backend as `{ userid, games: [{ gameIds, quantity }] }`, return response as-is

Both handlers:
- Return 401 if no token or userid resolution fails
- Return 502 on backend unreachable

### `app/api/orders/[id]/route.ts`

- **GET** — resolve userid, call `GET {BACKEND_URL}/api/orders/{id}?userid={id}`, return `{ order: Order }`

---

## Section 2: Checkout Flow — `OrderSummaryCard`

### State

```ts
type CheckoutStatus = 'idle' | 'loading' | 'error';
```

Local state: `status: CheckoutStatus`, `errorMessage: string | null`.

### Props change

`CartPageClient` passes `items: CartItem[]` down to `OrderSummaryCard` (in addition to existing `subtotal`).

### On "Proceed to Checkout" click

1. Set `status = 'loading'`, disable button
2. `POST /api/orders` with body:
   ```ts
   { games: items.map(i => ({ gameIds: parseInt(i.id), quantity: i.qty })) }
   ```
   (userid is resolved server-side in the proxy route)
3. **On `insufficient_balance`:**
   - Set `status = 'error'`, display inline below the button:
     > "Not enough balance. [Top up your wallet →]"
   - "Top up your wallet" opens the existing `TopUpModal`
4. **On success:**
   - `clearCart()`
   - `fetchBalance()` (refresh balance after deduction)
   - `router.push('/orders')`

### Button states

- `idle`: normal label "Proceed to Checkout"
- `loading`: disabled, label "Processing…"
- `error`: re-enabled after error is shown

---

## Section 3: Order List Page (`/orders`)

### `app/orders/page.tsx`

Server component. Auth-gated: if no `access_token` cookie, redirect to `/api/auth/login`.

Fetches all orders server-side via `GET /api/orders`.

**Renders:**
- Heading: "Your Orders"
- Table/list of all orders, each row showing:
  - Order ID
  - Partial key preview (first segment only, e.g. `XXXX-...`)
  - "View key" link → `/orders/[id]`
- If no orders: empty state message
- "Browse more games" link → `/games`

This page doubles as the post-checkout confirmation screen — the user lands here immediately after a successful purchase and sees their new orders at the top.

---

## Section 4: Order Detail Page (`/orders/[id]`)

### `app/orders/[id]/page.tsx`

Server component. Auth-gated: if no `access_token` cookie, redirect to `/api/auth/login`.

Fetches a single order server-side via `GET /api/orders/[id]`.

**Renders:**
- Heading: "Order #[id]"
- Game key in a prominent, copyable styled code block (the primary delivered value)
- Message: "Your key has been delivered. Redeem it on the platform."
- Navigation links:
  - "Back to all orders" → `/orders`
  - "Browse more games" → `/games`

No client interactivity needed — pure display.

---

## Section 5: Profile Order History (Live Data)

### `ProfileClient.tsx` — `OrderHistoryTab` and `OverviewTab`

Replace `mockRecentOrders` with real data fetched on mount.

**Fetch strategy:** `useEffect` on mount → `fetch('/api/orders')` → store in local state with `isLoading` flag. Show skeleton rows while loading.

**Display columns** (based on what `Order` type actually provides):
- Order ID
- Partial key preview (first segment only: `XXXX-...`)
- "View" link → `/orders/[id]` for the full key

Price and game title columns are dropped — the backend `Order` type does not include them, and cross-referencing each `games_id` against the games API would require N+1 fetches with no batch endpoint available.

**`OverviewTab` Recent Orders:** same approach — show last 3 orders from the same fetched list.

---

## Data Flow Diagram

```
User clicks "Proceed to Checkout"
  → POST /api/orders (client)
    → resolves userid from auth cookie (server)
    → POST /api/orders (backend)
      → creates N Order records (one per game × quantity)
      → insufficient_balance → inline error + TopUpModal link
      → success →
          clearCart()
          fetchBalance()
          router.push('/orders')
            → app/orders/page.tsx (server component)
              → GET /api/orders → render all orders list
                → user clicks "View key" on any order
                  → app/orders/[id]/page.tsx
                    → GET /api/orders/[id] → render key
```

---

## Files to Create

| File | Type | Purpose |
|------|------|---------|
| `app/api/orders/route.ts` | New | GET + POST proxy |
| `app/api/orders/[id]/route.ts` | New | GET single order proxy |
| `app/orders/page.tsx` | New | Order list / post-checkout confirmation |
| `app/orders/[id]/page.tsx` | New | Individual order key detail |

## Files to Modify

| File | Change |
|------|--------|
| `lib/types.ts` | Add `Order` interface |
| `components/cart/OrderSummaryCard.tsx` | Add checkout logic, loading/error states |
| `components/cart/CartPageClient.tsx` | Pass `items` prop to `OrderSummaryCard` |
| `components/profile/ProfileClient.tsx` | Replace mock orders with live API data |
