"use client";

import { useState, useEffect, useCallback } from "react";
import { setBalance } from "@/lib/balance-store";

const PRESETS = [5, 10, 25, 50, 100];

type ModalState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

interface TopUpModalProps {
  open: boolean;
  onClose: () => void;
}

export function TopUpModal({ open, onClose }: TopUpModalProps) {
  const [state, setState] = useState<ModalState>({ type: "idle" });
  const [amount, setAmount] = useState("10");

  // Detect return from Stripe Checkout success
  const [returnedSuccess, setReturnedSuccess] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("topup") === "success") {
      setReturnedSuccess(true);
      // Clean the query param from the URL without a navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("topup");
      window.history.replaceState({}, "", url.toString());
      // Poll until balance updates
      const deadline = Date.now() + 15_000;
      const poll = async () => {
        if (Date.now() > deadline) return;
        try {
          const res = await fetch("/api/balance");
          if (res.ok) {
            const data = await res.json();
            setBalance(data.balance);
          }
        } catch { /* ignore */ }
        setTimeout(poll, 1500);
      };
      poll();
    }
  }, []);

  // Reset to idle when modal opens
  useEffect(() => {
    if (open) {
      setState({ type: "idle" });
      setAmount("10");
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setReturnedSuccess(false);
    onClose();
  }, [onClose]);

  async function handleContinue() {
    const dollars = parseFloat(amount);
    if (!Number.isFinite(dollars) || dollars < 1) {
      setState({ type: "error", message: "Minimum top-up is €1.00" });
      return;
    }
    const cents = Math.round(dollars * 100);
    setState({ type: "loading" });
    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cents, returnUrl: window.location.href }),
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      setState({ type: "error", message: "Could not start payment. Please try again." });
    }
  }

  const isVisible = open || returnedSuccess;
  if (!isVisible) return null;

  const showSuccess = returnedSuccess || state.type === "success";

  return (
    <div className="fixed inset-0 z-9999">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Scrollable container */}
      <div className="relative h-full flex items-start justify-center py-8 px-4">
        {/* Modal */}
        <div className="relative w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-high p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-headline text-lg font-semibold text-on-surface">
              Top Up Balance
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Idle / amount selection */}
          {!showSuccess && (state.type === "idle" || state.type === "error") && (
            <div>
              <p className="mb-3 text-sm text-on-surface-variant">Select amount</p>
              <div className="mb-3 flex gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(String(preset))}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${amount === String(preset)
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mb-4 w-full rounded-lg bg-surface-container-highest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:ring-1 focus:ring-primary/40"
              />
              {state.type === "error" && (
                <p className="mb-3 text-xs text-error">{state.message}</p>
              )}
              <button
                onClick={handleContinue}
                className="w-full rounded-lg bg-linear-to-br from-primary to-primary-container py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Loading / redirecting */}
          {state.type === "loading" && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-on-surface-variant">Redirecting to payment…</p>
            </div>
          )}

          {/* Success */}
          {showSuccess && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/20">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-tertiary">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="font-headline text-lg font-semibold text-on-surface">Payment successful!</p>
              <p className="mt-1 text-sm text-on-surface-variant">Your balance will update shortly.</p>
              <button
                onClick={handleClose}
                className="mt-6 w-full rounded-lg bg-linear-to-br from-primary to-primary-container py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
