"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchBalance } from "@/lib/balance-store";
import { formatPrice } from "@/lib/format-price";
import { TopUpModal } from "@/components/wallet/TopUpModal";

type ModalState = "idle" | "loading" | "error";

interface PaymentMethodModalProps {
  id: string;
  open: boolean;
  onClose: () => void;
  total: number;               // in dollars — for display
  totalCents: number;         // in cents — used for balance shortfall check
  lineItems: Array<{
    name: string;
    priceCents: number;
    quantity: number;
  }>;
  onBalancePay: () => void;   // caller fires when "Pay from Balance" confirmed
  onStripePay: () => void;     // caller fires when "Pay with Stripe" confirmed
}

export function PaymentMethodModal({
  id,
  open,
  onClose,
  total,
  totalCents,
  onBalancePay,
  onStripePay,
}: PaymentMethodModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [balance, setBalance] = useState<number>(0);         // in dollars
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setBalanceLoading(true);
      setState("idle");
    }
  }

  const balanceShortfall = balance * 100 < totalCents;

  // Fetch balance whenever modal opens
  useEffect(() => {
    if (!open) return;
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

      <TopUpModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />

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
                    {balanceLoading ? "…" : (balance === 0 ? "€0.00" : formatPrice(balance))}
                  </span>
                </span>
              </div>

              {balanceShortfall && (
                <div className="ml-7 flex items-center justify-between gap-3">
                  <p id={shortfallMsgId} className="flex items-center gap-1.5 text-xs text-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Insufficient balance
                  </p>
                  <button
                    type="button"
                    onClick={() => setTopUpOpen(true)}
                    className="pointer-events-auto rounded-md border border-secondary/40 px-3 py-1 text-xs font-bold text-secondary transition-colors hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary/40"
                  >
                    Top Up
                  </button>
                </div>
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
