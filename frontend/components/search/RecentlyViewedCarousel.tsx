"use client";

import { useRef } from "react";
import type { RecentlyViewedGame } from "@/lib/types";

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/40 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      aria-label={`Scroll ${direction}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 6 15 12 9 18" />
        )}
      </svg>
    </button>
  );
}

export function RecentlyViewedCarousel({
  games,
}: {
  games: RecentlyViewedGame[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="text-on-surface-variant"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface">
            Recently Viewed
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <ArrowButton direction="left" onClick={() => scroll("left")} />
          <ArrowButton direction="right" onClick={() => scroll("right")} />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-1 flex gap-4 overflow-x-auto px-1"
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="group relative aspect-[16/10] w-[280px] shrink-0 overflow-hidden rounded-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-headline text-sm font-semibold text-on-surface">
                  {game.title}
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  {game.label}
                </span>
              </div>
              <span className="shrink-0 text-sm font-bold text-primary">
                ${game.price.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
