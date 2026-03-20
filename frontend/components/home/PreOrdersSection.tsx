import type { Game } from "@/lib/types";

export function PreOrdersSection({ games }: { games: Game[] }) {
  return (
    <section className="bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Upcoming Pre-orders
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-dim"
          >
            View All
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {games.map((game) => (
            <a
              key={game.id}
              href="#"
              className="group flex gap-4 rounded-xl bg-surface-container-high p-4 transition-colors hover:bg-surface-bright"
            >
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg">
                <div className="h-full w-full bg-gradient-to-br from-secondary-container/40 via-surface-bright to-surface-container" />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-headline text-sm font-semibold text-on-surface">
                    {game.title}
                  </h3>
                  {game.timeLeft && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <svg
                        className="text-secondary"
                        width="12"
                        height="12"
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
                      <span className="text-xs text-secondary">
                        {game.timeLeft}
                      </span>
                    </div>
                  )}
                </div>
                <span className="font-headline text-base font-bold text-on-surface">
                  €{game.price.toFixed(2)}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
