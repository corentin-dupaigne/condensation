export function GameCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 flex-col gap-2 rounded-lg bg-surface-container-high p-3 ${className ?? "w-[200px]"}`}
      aria-hidden="true"
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
  );
}
