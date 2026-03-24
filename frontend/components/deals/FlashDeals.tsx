"use client";

import type { Game } from "@/lib/types";
import { formatPrice } from "@/lib/format-price";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { Badge } from "@/components/shared/Badge";
import { PlatformBadge } from "@/components/shared/PlatformBadge";

export function FlashDeals({
  games,
  expiryDate,
}: {
  games: Game[];
  expiryDate: string;
}) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <svg
              className="text-cta"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              Flash Deals
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">Ends in</span>
            <CountdownTimer targetDate={new Date(expiryDate)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {games.map((game) => {
            const hasDiscount =
              game.discountPercent != null && game.discountPercent > 0;
            return (
              <a
                key={game.id}
                href={`/games/${game.slug}`}
                className="group relative rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
              >
                {hasDiscount && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge type="discount">-{game.discountPercent}%</Badge>
                  </div>
                )}
                <div className="mb-3 aspect-[3/2] overflow-hidden rounded">
                  {game.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={game.image}
                      alt={game.title}
                      width={200}
                      height={133}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
                  )}
                </div>
                <h3
                  className="truncate font-headline text-sm font-semibold text-on-surface"
                  title={game.title}
                >
                  {game.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  {game.platforms.map((p) => (
                    <PlatformBadge key={p} platform={p} />
                  ))}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-headline text-sm font-bold text-primary">
                    {formatPrice(game.price)}
                  </span>
                  {game.originalPrice != null && (
                    <span className="text-xs text-on-surface-variant line-through">
                      {formatPrice(game.originalPrice)}
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
