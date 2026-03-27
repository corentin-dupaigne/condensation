"use client";

import { formatPrice } from "@/lib/format-price";

export function OrderSummaryCard({
  subtotal,
  shieldEnabled,
  shieldPrice,
  couponDiscount,
}: {
  subtotal: number;
  shieldEnabled: boolean;
  shieldPrice: number;
  couponDiscount: number;
}) {
  const shieldCost = shieldEnabled ? shieldPrice : 0;
  const total = Math.max(0, subtotal - couponDiscount + shieldCost);

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

        {couponDiscount > 0 ? (
          <div className="flex justify-between text-on-surface-variant">
            <span>Coupon</span>
            <span className="font-headline font-bold text-secondary">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        ) : null}

        {shieldEnabled ? (
          <div className="flex justify-between text-on-surface-variant">
            <span>Shield Protection</span>
            <span className="font-headline font-bold text-on-surface">
              {formatPrice(shieldPrice)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="border-t border-outline-variant/20 pt-6">
        <div className="mb-8 flex items-baseline justify-between">
          <span className="font-headline text-lg font-bold uppercase tracking-widest">
            Total
          </span>
          <div className="text-right">
            <span className="block font-headline text-4xl font-black text-secondary">
              {formatPrice(total)}
            </span>
            <span className="text-[10px] uppercase tracking-tight text-on-surface-variant">
              VAT included where applicable
            </span>
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-xl bg-gradient-to-br from-secondary to-secondary-dim py-5 font-headline text-lg font-black uppercase tracking-widest text-on-secondary shadow-[0_0_30px_rgba(161,250,255,0.18)] transition-all duration-150 hover:shadow-[0_0_45px_rgba(161,250,255,0.26)] active:scale-[0.98]"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

