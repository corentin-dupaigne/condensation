import type { Platform } from "@/lib/types";

const platformConfig: Record<Platform, { label: string; color: string }> = {
  windows: { label: "Windows", color: "text-[#00adef]" },
  mac: { label: "macOS", color: "text-[#a2aaad]" },
  linux: { label: "Linux", color: "text-[#f5a623]" },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const config = platformConfig[platform] ?? { label: platform, color: "text-on-surface-variant" };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-surface-container-highest px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.color}`}
    >
      {config.label}
    </span>
  );
}
