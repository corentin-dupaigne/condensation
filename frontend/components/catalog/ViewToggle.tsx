import type { ViewMode } from "@/lib/types";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex overflow-hidden rounded-lg bg-surface-container-high">
      <button
        onClick={() => onChange("grid")}
        className={`flex h-8 w-8 items-center justify-center transition-colors ${
          value === "grid"
            ? "bg-primary/15 text-primary"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
        aria-label="Grid view"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
      <button
        onClick={() => onChange("list")}
        className={`flex h-8 w-8 items-center justify-center transition-colors ${
          value === "list"
            ? "bg-primary/15 text-primary"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
        aria-label="List view"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  );
}
