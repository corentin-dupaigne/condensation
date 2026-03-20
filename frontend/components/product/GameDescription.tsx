"use client";

import { useState } from "react";

export function GameDescription({
  descriptions,
}: {
  descriptions: string[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-3 font-headline text-lg font-bold uppercase tracking-tight text-on-surface">
        <span className="text-on-surface-variant">—</span>
        The Last Light of Stellaris
      </h2>

      <div className="space-y-4 text-sm leading-relaxed text-on-surface-variant">
        <p>{descriptions[0]}</p>
        {expanded && descriptions.slice(1).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {descriptions.length > 1 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:text-primary-dim"
        >
          {expanded ? "Show Less ↑" : "Read More →"}
        </button>
      )}
    </section>
  );
}
