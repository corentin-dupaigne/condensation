# Balance API Fetch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the localStorage-only balance display in the Header with a real `GET /api/balance` fetch, showing a skeleton until the value loads.

**Architecture:** Add `balanceLoaded` state + `useBalanceLoaded()` + `fetchBalance()` to the existing `balance-store.ts`. The Header calls `fetchBalance()` on mount and renders a skeleton until `useBalanceLoaded()` returns `true`. All existing callers of `setBalance` (TopUpModal, SettingsClient) implicitly mark the balance as loaded — no changes needed there.

**Tech Stack:** Next.js 14 App Router, React 19 `useSyncExternalStore`, TypeScript, Tailwind CSS 4

---

### Task 1: Extend `balance-store.ts` with `balanceLoaded`, `useBalanceLoaded`, and `fetchBalance`

**Files:**
- Modify: `frontend/lib/balance-store.ts`

- [ ] **Step 1: Add `balanceLoaded` module variable and update `setBalance` to set it**

  Open `frontend/lib/balance-store.ts`. After line 9 (`let cachedBalance = 0;`), add:

  ```ts
  let balanceLoaded = false;
  ```

  Then update `writeBalance` (currently lines 34–42) to set `balanceLoaded = true` before dispatching the event:

  ```ts
  function writeBalance(amount: number) {
    if (typeof window === "undefined") return;
    const clamped = Math.round(Math.max(0, amount) * 100) / 100;
    const raw = String(clamped);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedBalance = clamped;
    balanceLoaded = true;
    window.dispatchEvent(new Event(EVENT_NAME));
  }
  ```

- [ ] **Step 2: Add `readLoaded`, `subscribeLoaded`, `useBalanceLoaded`, and `fetchBalance` exports**

  Append to the end of `frontend/lib/balance-store.ts`:

  ```ts
  function readLoaded(): boolean {
    return balanceLoaded;
  }

  export function useBalanceLoaded(): boolean {
    return useSyncExternalStore(subscribe, readLoaded, () => false);
  }

  export async function fetchBalance(): Promise<void> {
    try {
      const res = await fetch("/api/balance");
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.balance === "number") setBalance(data.balance);
    } catch {
      // Silently fail — skeleton persists
    }
  }
  ```

  Note: `useBalanceLoaded` reuses the existing `subscribe` function — the same `condensation:balance` event fires when `writeBalance` runs, so both `useBalance` and `useBalanceLoaded` update together.

- [ ] **Step 3: Verify the file compiles**

  ```bash
  cd frontend && bun run build 2>&1 | grep -E "error|Error" | head -20
  ```

  Expected: no TypeScript errors in `lib/balance-store.ts`.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/lib/balance-store.ts
  git commit -m "feat: add balanceLoaded flag, useBalanceLoaded, and fetchBalance to balance-store"
  ```

---

### Task 2: Update `Header.tsx` to fetch on mount and show skeleton

**Files:**
- Modify: `frontend/components/layout/Header.tsx`

- [ ] **Step 1: Import `fetchBalance` and `useBalanceLoaded`**

  Find the existing import on line 8:

  ```ts
  import { useBalance } from "@/lib/balance-store";
  ```

  Replace with:

  ```ts
  import { useBalance, useBalanceLoaded, fetchBalance } from "@/lib/balance-store";
  ```

- [ ] **Step 2: Add `useBalanceLoaded` hook call and `fetchBalance` effect**

  After the existing line `const balance = useBalance();` (around line 36), add:

  ```ts
  const balanceLoaded = useBalanceLoaded();

  useEffect(() => {
    if (isLoggedIn) fetchBalance();
  }, [isLoggedIn]);
  ```

- [ ] **Step 3: Replace balance text with skeleton-aware render**

  Find the `<span>` inside the balance button (around line 256):

  ```tsx
  <span className="tabular-nums">${balance.toFixed(2)}</span>
  ```

  Replace with:

  ```tsx
  {balanceLoaded ? (
    <span className="tabular-nums">${balance.toFixed(2)}</span>
  ) : (
    <span className="inline-block h-3.5 w-12 animate-pulse rounded bg-on-surface/10" />
  )}
  ```

- [ ] **Step 4: Verify the file compiles**

  ```bash
  cd frontend && bun run build 2>&1 | grep -E "error|Error" | head -20
  ```

  Expected: no TypeScript errors.

- [ ] **Step 5: Verify lint passes**

  ```bash
  cd frontend && bun run lint 2>&1 | tail -20
  ```

  Expected: no errors.

- [ ] **Step 6: Commit**

  ```bash
  git add frontend/components/layout/Header.tsx
  git commit -m "feat: fetch balance on mount in Header, show skeleton while loading"
  ```
