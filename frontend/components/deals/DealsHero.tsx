export function DealsHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-container/20 via-surface to-surface">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)/0.08,_transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Limited Time
          </span>
          <h1 className="mt-4 font-headline text-5xl font-bold tracking-tight text-on-surface md:text-6xl">
            Today&apos;s Best Deals
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
            Discover massive savings on the biggest PC and console game keys.
            Flash deals, weekly specials, and clearance prices updated daily.
          </p>
        </div>
      </div>
    </section>
  );
}
