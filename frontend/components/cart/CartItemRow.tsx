"use client";

import { PlatformBadge } from "@/components/shared/PlatformBadge";
import { formatPrice } from "@/lib/format-price";
import type { CartItem } from "@/lib/cart-store";
import { removeFromCart, setCartItemQty } from "@/lib/cart-store";

export function CartItemRow({ item }: { item: CartItem }) {
  const hasDiscount =
    item.discountPercent != null && item.discountPercent > 0 && item.originalPrice;

  return (
    <div className="group relative flex flex-col gap-6 rounded-xl border-l-2 border-transparent bg-surface-container-low p-6 transition-colors duration-300 hover:bg-surface-container-high hover:border-secondary md:flex-row">
      <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg bg-surface-container-highest md:w-48">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={item.title}
            src={item.image}
            width={192}
            height={128}
            loading="lazy"
            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-100"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {item.platforms.map((p) => (
              <PlatformBadge key={p} platform={p} />
            ))}
          </div>
          <h3 className="font-headline text-2xl font-bold text-on-surface">
            {item.title}
          </h3>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-lg border border-outline-variant/10 bg-surface-container-highest p-1">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
              aria-label={`Decrease quantity for ${item.title}`}
              onClick={() => setCartItemQty(item.id, Math.max(1, item.qty - 1))}
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <span className="w-10 text-center text-sm font-bold tabular-nums text-on-surface">
              {item.qty}
            </span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface"
              aria-label={`Increase quantity for ${item.title}`}
              onClick={() => setCartItemQty(item.id, Math.min(99, item.qty + 1))}
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant transition-colors hover:text-error"
            onClick={() => removeFromCart(item.id)}
            aria-label={`Remove ${item.title} from cart`}
          >
            <span aria-hidden className="text-sm leading-none">
              ×
            </span>
            Remove
          </button>
        </div>
      </div>

      <div className="text-right">
        {hasDiscount ? (
          <div className="inline-block rounded-sm bg-tertiary-container px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-on-tertiary-container">
            -{item.discountPercent}% OFF
          </div>
        ) : null}
        {hasDiscount ? (
          <div className="mt-1 text-sm text-on-surface-variant line-through">
            {formatPrice(item.originalPrice as number)}
          </div>
        ) : null}
        <div className="mt-1 font-headline text-3xl font-black text-on-surface">
          {formatPrice(item.price)}
        </div>
      </div>
    </div>
  );
}

