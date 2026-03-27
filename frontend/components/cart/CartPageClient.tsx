"use client";

import { useMemo, useState } from "react";
import { GameCard } from "@/components/shared/GameCard";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { OrderSummaryCard } from "@/components/cart/OrderSummaryCard";
import { clearCart, getCartSubtotal, useCartState } from "@/lib/cart-store";
import type { Game } from "@/lib/types";

export function CartPageClient({ recommendedGames }: { recommendedGames: Game[] }) {
  const cart = useCartState();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [shieldEnabled, setShieldEnabled] = useState(true);

  const itemCount = cart.items.reduce((sum, it) => sum + it.qty, 0);
  const subtotal = getCartSubtotal(cart);
  const shieldPrice = 1.99;

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.toUpperCase() === "WELCOME10") return Math.min(10, subtotal);
    return 0;
  }, [appliedCoupon, subtotal]);

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

          <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-6">
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="ENTER CODE"
                  className="h-11 flex-1 rounded-lg bg-surface-container-highest px-4 font-headline text-sm uppercase tracking-widest text-on-surface outline-none ring-0 placeholder:text-on-surface-variant/60 focus:ring-1 focus:ring-secondary/40"
                />
                <button
                  type="button"
                  className="h-11 rounded-lg bg-surface-container-highest px-5 font-headline text-sm font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-bright"
                  onClick={() => setAppliedCoupon(couponCode.trim() || null)}
                >
                  Apply
                </button>
              </div>
              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    Applied <span className="font-headline font-bold text-secondary">{appliedCoupon.toUpperCase()}</span>
                  </span>
                  <button
                    type="button"
                    className="font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
                    onClick={() => setAppliedCoupon(null)}
                    aria-label="Remove coupon"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>

            <div className="relative overflow-hidden rounded-xl border border-secondary/10 bg-surface-container-low p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />
              <div className="relative z-10 flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary" aria-hidden>
                      ✓
                    </span>
                    <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface">
                      Condensation Shield
                    </h3>
                  </div>
                  <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-on-surface-variant">
                    Guaranteed refund if key doesn&apos;t work, priority support.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className="font-headline text-sm font-black text-secondary">
                    €{shieldPrice.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShieldEnabled((v) => !v)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      shieldEnabled ? "bg-secondary" : "bg-surface-container-highest"
                    }`}
                    aria-label="Toggle shield protection"
                    aria-pressed={shieldEnabled}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-on-secondary transition-transform ${
                        shieldEnabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
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
          <OrderSummaryCard
            subtotal={subtotal}
            shieldEnabled={shieldEnabled}
            shieldPrice={shieldPrice}
            couponDiscount={couponDiscount}
          />
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

