"use client";

import { GameCard } from "@/components/shared/GameCard";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { OrderSummaryCard } from "@/components/cart/OrderSummaryCard";
import { clearCart, getCartSubtotal, useCartState } from "@/lib/cart-store";
import type { Game } from "@/lib/types";

export function CartPageClient({ recommendedGames }: { recommendedGames: Game[] }) {
  const cart = useCartState();

  const itemCount = cart.items.reduce((sum, it) => sum + it.qty, 0);
  const subtotal = getCartSubtotal(cart);

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
          <OrderSummaryCard subtotal={subtotal} />
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
