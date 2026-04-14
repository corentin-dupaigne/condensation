"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchBalance, getBalance as readBalance } from "@/lib/balance-store";
import { formatPrice } from "@/lib/format-price";

type ModalState = "idle" | "loading" | "error";

interface LineItem {
  name: string;
  priceCents: number;
  quantity: number;
}

interface PaymentMethodModalProps {
  id: string;
  open: boolean;
  onClose: () => void;
  total: number;
  totalCents: number;
  lineItems: LineItem[];
  onBalancePay: () => void;
  onStripePay: () => void;
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
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const balanceShortfall = balance * 100 < totalCents;

  useEffect(() => {
    if (!open) {
      setState("idle");
      return;
    }
    let mounted = true;
    setBalanceLoading(true);
    setState("idle");
    fetchBalance()
      .then(() => { if (mounted) setBalance(readBalance()); })
      .finally(() => { if (mounted) setBalanceLoading(false); });
    return () => { mounted = false; };
  }, [open]);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleEscape]);

  if (!open) return null;

  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const shortfallMsgId = `${id}-shortfall`;

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative h-full flex items-start justify-center py-8 px-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          className="relative w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-high p-6 shadow-2xl"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2
              id={titleId}
              className="font-headline text-lg font-semibold text-on-surface"
            >
              Choose Payment Method
            </h2>
            <button
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

          <p id={descId} className="mb-6 text-sm text-on-surface-variant">
            Total:{" "}
            <span className="font-headline font-bold text-on-surface">
              {formatPrice(total)}
            </span>
          </p>

          <div className="space-y-3" data-testid="payment-options">
            <div
              className={[
                "flex flex-col gap-2 rounded-xl border p-4 transition-colors",
                balanceShortfall
                  ? "border-error/50 bg-error/5"
                  : "border-outline-variant/20 bg-surface-container-highest",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
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
                <p id={shortfallMsgId} className="flex items-center gap-1.5 text-xs text-error">
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
                    ? "cursor-not-allowed bg-surface-container text-on-surface-variant"
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
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-highest p-4 transition-colors hover:border-primary/30">
              <div className="flex items-center gap-3">
                <span className="font-headline font-bold text-on-surface">
                  Pay with Card (Stripe)
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
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
            </div>
          </div>

          {state === "error" && (
            <p className="mt-3 text-center text-sm text-error" role="alert">
              Something went wrong. Please try again.
            </p>
          )}

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
