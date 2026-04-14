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
