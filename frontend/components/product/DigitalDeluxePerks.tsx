import React from "react";
import type { DeluxePerk } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  confirmation_number: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  music_note: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  photo_camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3" />
    </svg>
  ),
};

export function DigitalDeluxePerks({ perks }: { perks: DeluxePerk[] }) {
  return (
    <section className="overflow-hidden rounded-xl bg-secondary-container/20 p-6">
      <h3 className="mb-4 flex items-center gap-2 font-headline text-base font-bold uppercase tracking-wider text-secondary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        Digital Deluxe Perks
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {perks.map((perk) => (
          <div key={perk.title} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
              {iconMap[perk.icon] ?? (
                <span className="text-xs">{perk.icon}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface">
                {perk.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-on-surface-variant">
                {perk.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
