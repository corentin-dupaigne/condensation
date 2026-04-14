# Balance API Fetch — Design Spec

**Date:** 2026-04-13  
**Branch:** feat/frontend-api-adapt

## Problem

`useBalance()` reads from a localStorage cache. The Header shows `$0.00` on initial render until another component (Settings, TopUpModal) happens to call `setBalance`. The Header never fetches the balance itself.

## Goal

- Header fetches balance from `GET /api/balance` once on mount (when logged in)
- Shows a skeleton while loading
- Updates reactively when `setBalance` is called elsewhere (e.g. after top-up)

## Solution: Add `loaded` flag to balance store (Option A)

### `lib/balance-store.ts` changes

Add a module-level `balanceLoaded: boolean` variable alongside `cachedBalance`.

New exports:
- `useBalanceLoaded(): boolean` — `useSyncExternalStore` hook; returns `true` once `setBalance` has been called at least once in this session
- `fetchBalance(): Promise<void>` — calls `GET /api/balance`, then `setBalance(data.balance)`; silently swallows errors (skeleton persists on failure)

Modified:
- `setBalance(cents)` — unchanged in behaviour, but also sets `balanceLoaded = true` and fires the existing `condensation:balance` event (so both `useBalance` and `useBalanceLoaded` update in one dispatch)

No changes to `SettingsClient` or `TopUpModal` — they already call `setBalance`, which now also marks loaded.

### `components/layout/Header.tsx` changes

- On mount (when `isLoggedIn`): call `fetchBalance()` in a `useEffect`
- Read `const loaded = useBalanceLoaded()`
- In the balance button: show a skeleton (`animate-pulse` rounded rect, ~`w-12 h-3.5`) when `!loaded`; show `$${balance.toFixed(2)}` when loaded

The skeleton dimensions approximate the balance text width so the button doesn't shift layout.

## Data flow

```
Header mounts (isLoggedIn)
  → useEffect calls fetchBalance()
    → GET /api/balance (Next.js route, reads auth cookie)
      → backend GET /api/balance?userid=...
    → setBalance(data.balance)
      → balanceLoaded = true
      → fires condensation:balance event
        → useBalance() updates → Header shows balance
        → useBalanceLoaded() updates → skeleton hides
```

On top-up success (TopUpModal / SettingsClient already call setBalance):
- `useBalance()` updates → Header shows new balance
- `useBalanceLoaded()` already `true` → no effect

## Error handling

- `fetchBalance` catches all errors and returns silently
- On failure: balance stays `0`, `balanceLoaded` stays `false`, skeleton remains visible
- No retry logic

## Files changed

- `frontend/lib/balance-store.ts` — add `balanceLoaded`, `useBalanceLoaded`, `fetchBalance`
- `frontend/components/layout/Header.tsx` — call `fetchBalance` on mount, show skeleton
