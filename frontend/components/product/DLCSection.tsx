interface DLCItem {
  id: string;
  title: string;
  price: number;
}

export function DLCSection({ items }: { items: DLCItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-base font-bold uppercase tracking-wider text-on-surface">
          Downloadable Content
        </h2>
        <a
          href="#"
          className="text-[10px] font-semibold uppercase tracking-widest text-primary transition-colors hover:text-primary-dim"
        >
          View All DLC
        </a>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
          >
            {/* Placeholder image */}
            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-surface-container-highest via-surface-bright to-surface-container" />

            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">
                {item.title}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                Release Oct 2088
              </p>
            </div>

            <span className="text-sm font-bold text-on-surface">
              €{item.price.toFixed(2)}
            </span>

            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
              aria-label={`Add ${item.title} to cart`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
