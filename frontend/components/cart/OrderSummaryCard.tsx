"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format-price";
import { clearCart } from "@/lib/cart-store";
import { fetchBalance } from "@/lib/balance-store";
import { PaymentMethodModal } from "@/components/checkout/PaymentMethodModal";
import type { CartItem } from "@/lib/cart-store";

export function OrderSummaryCard({
  subtotal,
  items,
  isLoggedIn = false,
}: {
  subtotal: number;
  items: CartItem[];
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleBalancePay() {
    setShowPaymentModal(false);
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
      router.push("/orders?purchase=success");
    } catch {
      setStatus("error");
    }
  }

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
          onClick={() => {
            if (!isLoggedIn) {
              router.push("/api/auth/login");
              return;
            }
            setShowPaymentModal(true);
          }}
          disabled={status === "loading"}
          className="w-full rounded-xl cta-gradient py-5 font-headline text-lg font-black uppercase tracking-widest text-on-primary-fixed shadow-[0_0_30px_rgba(161,250,255,0.18)] transition-all duration-150 hover:brightness-110 hover:shadow-[0_0_45px_rgba(161,250,255,0.26)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
                setShowPaymentModal(true);
              }}
              className="underline text-primary hover:text-primary/80"
            >
              Choose payment method →
            </button>
          </p>
        )}
      </div>

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
    </div>
  );
}
