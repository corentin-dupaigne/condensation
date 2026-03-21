"use client";

import { useState } from "react";
import type { GameDetail } from "@/lib/types";

export function ProductHero({ game }: { game: GameDetail }) {
  const [selectedEdition, setSelectedEdition] = useState<"standard" | "deluxe">(
    "standard"
  );

  const thumbnails = Array.from({ length: 8 }, (_, i) => i);

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-6 lg:grid-cols-[1fr_400px]">
      {/* Left — Media */}
      <div className="flex flex-col gap-3">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#0a2a3a] via-[#0f3040] to-[#162530]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3/4 w-1/2 rounded-lg bg-gradient-to-b from-primary/20 via-secondary/10 to-transparent" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-primary/60 to-transparent" />
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {thumbnails.map((i) => (
            <button
              key={i}
              className={`aspect-video h-14 shrink-0 overflow-hidden rounded-md transition-all ${
                i === 0
                  ? "ring-2 ring-primary"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(${135 + i * 25}deg, 
                    hsl(${180 + i * 20}, 60%, ${12 + i * 2}%), 
                    hsl(${200 + i * 15}, 50%, ${8 + i * 3}%))`,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Right — Purchase Panel */}
      <div className="flex flex-col gap-4">
        {/* Title + age rating */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-bold uppercase leading-none tracking-tight text-on-surface">
              {game.title}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 text-primary">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-xs">
                    {s}
                  </span>
                ))}
              </span>
              <span className="text-xs uppercase tracking-wider text-on-surface-variant">
                Open World Action RPG
              </span>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-surface-container-highest px-2 py-1 text-center text-[10px] font-bold uppercase leading-tight text-on-surface-variant">
            {game.ageRating.split(" ")[0]}
            <br />
            <span className="text-[9px]">{game.ageRating.split(" ")[1]}</span>
          </span>
        </div>

        {/* Edition selector */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
            Select Edition
          </p>

          {/* Standard Edition */}
          <button
            onClick={() => setSelectedEdition("standard")}
            className={`mb-2 flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all ${
              selectedEdition === "standard"
                ? "bg-surface-container-highest ring-1 ring-primary/30"
                : "bg-surface-container-high hover:bg-surface-container-highest"
            }`}
          >
            <div>
              <p className="text-sm font-bold text-on-surface">
                Standard Edition
              </p>
              <p className="text-[10px] text-on-surface-variant">
                Base Game and Digital Soundtrack
              </p>
            </div>
            <span className="text-lg font-bold text-on-surface">
              ${game.editionStandardPrice.toFixed(2)}
            </span>
          </button>

          {/* Digital Deluxe */}
          <button
            onClick={() => setSelectedEdition("deluxe")}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all ${
              selectedEdition === "deluxe"
                ? "bg-surface-container-highest ring-1 ring-primary/30"
                : "bg-surface-container-high hover:bg-surface-container-highest"
            }`}
          >
            <div>
              <p className="text-sm font-bold text-on-surface">
                Digital Deluxe
              </p>
              <p className="text-[10px] text-on-surface-variant">
                Base Game, Season Pass, and Exclusive Armor Sets
              </p>
            </div>
            <span className="text-lg font-bold text-on-surface">
              ${game.editionDeluxePrice.toFixed(2)}
            </span>
          </button>
        </div>

        {/* CTA Buttons */}
        <button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-container py-3.5 text-sm font-bold uppercase tracking-wider text-on-primary-fixed transition-opacity hover:opacity-90">
          Buy Now
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/20 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add to Cart
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/20 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            Wishlist
          </button>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-6 pt-2">
          {/* Metacritic */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-highest">
              <span className="text-xl font-bold text-primary">
                {game.metaScore}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Metacritic
            </span>
          </div>

          {/* Recommended */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-highest">
              <span className="text-xl font-bold text-tertiary">
                {game.recommendedPercent}%
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Recommended
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
