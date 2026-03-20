"use client";

import { CountdownTimer } from "@/components/shared/CountdownTimer";

const saleEnd = new Date(Date.now() + 4 * 60 * 60 * 1000 + 12 * 60 * 1000 + 55 * 1000);

export function PromoBanner() {
  return (
    <section className="bg-surface-container-low">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="rounded bg-error/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-error">
            Flash Sale Ending Soon
          </span>
          <CountdownTimer targetDate={saleEnd} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-on-surface-variant">
            Up to <span className="font-bold text-tertiary">90% OFF</span> on Horror Collection
          </span>
          <a
            href="#"
            className="rounded-lg bg-surface-container-highest px-4 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-bright"
          >
            Explore Deals
          </a>
        </div>
      </div>
    </section>
  );
}
