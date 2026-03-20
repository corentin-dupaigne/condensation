export function SearchHero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-10 pb-6">
      <p className="mb-3 font-headline text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Search Intelligence
      </p>

      <div className="flex items-end justify-between gap-8">
        <h1 className="font-headline text-5xl font-bold uppercase tracking-tight text-on-surface md:text-6xl">
          Results for{" "}
          <span className="text-primary">&lsquo;Cyberpunk&rsquo;</span>
        </h1>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="font-headline text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            128 Records Retrieved
          </span>
        </div>
      </div>
    </section>
  );
}
