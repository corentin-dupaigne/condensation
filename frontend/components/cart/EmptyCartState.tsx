"use client";

import Link from "next/link";

export function EmptyCartState() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="font-headline text-2xl font-black tracking-tight text-on-surface">
        Your cart is empty
      </p>
      <p className="mt-2 text-sm text-on-surface-variant">
        Add a few games and come back when you&apos;re ready to checkout.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/games"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary-container px-5 font-headline text-sm font-black uppercase tracking-widest text-on-secondary transition-opacity hover:opacity-90"
        >
          Browse games
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-surface-container-highest px-5 font-headline text-sm font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-bright"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

