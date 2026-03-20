import type { Platform } from "@/lib/types";

const platformConfig: Record<Platform, { label: string; color: string }> = {
  steam: { label: "Steam", color: "text-[#66c0f4]" },
  epic: { label: "Epic", color: "text-[#f5f5f5]" },
  xbox: { label: "Xbox", color: "text-[#107c10]" },
  playstation: { label: "PS", color: "text-[#006fcd]" },
  switch: { label: "Switch", color: "text-[#e4000f]" },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const config = platformConfig[platform];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-surface-container-highest px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.color}`}
    >
      {config.label}
    </span>
  );
}
