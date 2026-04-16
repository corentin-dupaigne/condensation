export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen">
      {/* Breadcrumb skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-4 flex gap-2 items-center">
        <div className="h-3 w-10 rounded bg-surface-container-highest animate-pulse" />
        <div className="h-3 w-2 rounded bg-surface-container-highest animate-pulse" />
        <div className="h-3 w-12 rounded bg-surface-container-highest animate-pulse" />
        <div className="h-3 w-2 rounded bg-surface-container-highest animate-pulse" />
        <div className="h-3 w-32 rounded bg-surface-container-highest animate-pulse" />
      </div>

      {/* ProductHero skeleton */}
      <section className="mx-auto max-w-7xl mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left — Media gallery */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-container-high animate-pulse" />
            <div className="flex gap-4 pb-2 h-[10vh]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="min-w-28 aspect-video shrink-0 rounded-lg bg-surface-container-highest animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Right — Purchase panel */}
          <div className="lg:col-span-4 space-y-8 sticky top-28">
            {/* Title */}
            <div className="space-y-3">
              <div className="h-10 w-3/4 rounded bg-surface-container-highest animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-surface-container-highest animate-pulse" />
            </div>

            {/* Edition cards */}
            <div className="space-y-3">
              <div className="h-24 w-full rounded-xl bg-surface-container-high animate-pulse" />
              <div className="h-16 w-full rounded-xl bg-surface-container-high animate-pulse" />
            </div>

            {/* Key count line */}
            <div className="h-3 w-28 rounded bg-surface-container-highest animate-pulse" />

            {/* CTA buttons */}
            <div className="space-y-3 pt-4">
              <div className="h-14 w-full rounded-xl bg-surface-container-highest animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 rounded-xl bg-surface-container-highest animate-pulse" />
                <div className="h-11 rounded-xl bg-surface-container-highest animate-pulse" />
              </div>
            </div>

            {/* Scores */}
            <div className="flex gap-4 items-center justify-center pt-4">
              <div className="h-12 w-12 rounded bg-surface-container-highest animate-pulse" />
              <div className="w-px h-8 bg-outline-variant/30" />
              <div className="h-12 w-12 rounded bg-surface-container-highest animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Description + Sidebar skeleton */}
      <div className="mx-auto flex max-w-7xl gap-20 mb-8 px-6">
        {/* Description */}
        <div className="w-2/3 space-y-4">
          <div className="h-6 w-40 rounded bg-surface-container-highest animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded bg-surface-container-highest animate-pulse ${i % 3 === 2 ? "w-2/3" : "w-full"}`}
            />
          ))}
          <div className="mt-6 h-6 w-32 rounded bg-surface-container-highest animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded bg-surface-container-highest animate-pulse ${i % 2 === 1 ? "w-3/4" : "w-full"}`}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-1/3 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 rounded bg-surface-container-highest animate-pulse" />
              <div className="h-4 w-28 rounded bg-surface-container-high animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Related games skeleton */}
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="h-6 w-36 rounded bg-surface-container-highest animate-pulse mb-6" />
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex shrink-0 flex-col gap-2 rounded-lg bg-surface-container-high p-3 w-[200px]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-surface-container-highest animate-pulse" />
              <div className="h-3.5 w-3/4 rounded bg-surface-container-highest animate-pulse" />
              <div className="flex gap-1">
                <div className="h-3 w-10 rounded bg-surface-container-highest animate-pulse" />
                <div className="h-3 w-8 rounded bg-surface-container-highest animate-pulse" />
              </div>
              <div className="mt-auto flex items-center justify-between">
                <div className="h-4 w-14 rounded bg-surface-container-highest animate-pulse" />
                <div className="h-11 w-11 rounded bg-surface-container-highest animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
