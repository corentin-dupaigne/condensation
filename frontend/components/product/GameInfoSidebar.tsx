"use client";

import { useState } from "react";
import type { GameDetail } from "@/lib/types";

export function GameInfoSidebar({ game }: { game: GameDetail }) {
  const [reqTab, setReqTab] = useState<"minimum" | "recommended">("minimum");
  const reqs = game.systemRequirements[reqTab];

  return (
    <aside className="space-y-6">
      {/* Free Demo Banner */}
      <div className="rounded-xl bg-surface-container-high p-5">
        <div className="mb-2 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-tertiary"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
            Free Demo Available
          </span>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-on-surface-variant">
          Experience the first hour of Stellaris. Progress carries over to the
          full game.
        </p>
        <button className="w-full rounded-lg bg-tertiary-container py-2.5 text-xs font-bold uppercase tracking-wider text-on-tertiary-container transition-opacity hover:opacity-90">
          Download Demo
        </button>
      </div>

      {/* Game Metadata */}
      <div className="space-y-3 text-xs">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Developer</span>
          <span className="font-medium text-on-surface">{game.developer}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Publisher</span>
          <span className="font-medium text-on-surface">{game.publisher}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Release Date</span>
          <span className="font-medium text-on-surface">
            {game.releaseDate}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Genre</span>
          <span className="font-medium text-on-surface">
            {game.genres.join(", ")}
          </span>
        </div>
      </div>

      {/* Feature Tags */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Features
        </p>
        <div className="flex flex-wrap gap-1.5">
          {game.features.map((f) => (
            <span
              key={f}
              className="rounded-md bg-surface-container-highest px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Supported Languages
        </p>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-on-surface-variant">
              <th className="pb-1.5 text-left font-normal">Languages</th>
              <th className="pb-1.5 text-center font-normal">Interface</th>
              <th className="pb-1.5 text-center font-normal">Audio</th>
              <th className="pb-1.5 text-center font-normal">Subtitles</th>
            </tr>
          </thead>
          <tbody>
            {game.languages.map((lang) => (
              <tr key={lang.language}>
                <td className="py-1 text-on-surface">{lang.language}</td>
                <td className="py-1 text-center text-primary">
                  {lang.interface ? "✓" : "—"}
                </td>
                <td className="py-1 text-center text-primary">
                  {lang.audio ? "✓" : "—"}
                </td>
                <td className="py-1 text-center text-primary">
                  {lang.subtitles ? "✓" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Requirements */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          System Requirements
        </p>
        <div className="mb-3 flex gap-1 rounded-lg bg-surface-container p-1">
          {(["minimum", "recommended"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setReqTab(tab)}
              className={`flex-1 rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                reqTab === tab
                  ? "bg-surface-container-highest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="space-y-2 text-[11px]">
          {(
            Object.entries(reqs) as [string, string][]
          ).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="shrink-0 capitalize text-on-surface-variant">
                {key}
              </span>
              <span className="text-right font-medium text-on-surface">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Social Sharing */}
      <div className="flex gap-3 pt-2">
        {["share", "bookmark", "flag"].map((action) => (
          <button
            key={action}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label={action}
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
              {action === "share" && (
                <>
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                </>
              )}
              {action === "bookmark" && (
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              )}
              {action === "flag" && (
                <>
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" x2="4" y1="22" y2="15" />
                </>
              )}
            </svg>
          </button>
        ))}
      </div>
    </aside>
  );
}
