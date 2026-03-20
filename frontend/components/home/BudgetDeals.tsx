"use client";

import { useState } from "react";
import type { DealTier } from "@/lib/types";

export function BudgetDeals({ tiers }: { tiers: DealTier[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const activeTier = tiers[activeTab];

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Insane Budget Deals
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-dim"
          >
            Browse all deals
          </a>
        </div>

        <div className="mb-6 flex gap-2">
          {tiers.map((tier, i) => (
            <button
              key={tier.label}
              onClick={() => setActiveTab(i)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                i === activeTab
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {activeTier.games.map((game) => (
            <a
              key={game.id}
              href="#"
              className="group rounded-lg bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
            >
              <div className="mb-3 aspect-[4/3] overflow-hidden rounded">
                <div className="h-full w-full bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />
              </div>
              <h3 className="truncate text-sm font-semibold text-on-surface">
                {game.title}
              </h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-headline text-sm font-bold text-primary">
                  €{game.price.toFixed(2)}
                </span>
                {game.originalPrice != null && (
                  <span className="text-xs text-on-surface-variant line-through">
                    €{game.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
