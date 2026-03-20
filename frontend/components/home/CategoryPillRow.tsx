export function CategoryPillRow({ genres }: { genres: string[] }) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((genre, i) => (
            <a
              key={genre}
              href="#"
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
              }`}
            >
              {genre}
            </a>
          ))}

          <div className="ml-auto flex shrink-0 items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-tertiary" />
            </span>
            <span className="text-xs font-medium text-on-surface-variant">
              Connected with <span className="text-on-surface">Steam</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
