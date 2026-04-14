"use client";

import { useState } from "react";
import type { BackendGameDetail } from "@/lib/types";

export function GameInfoSidebar({ game }: { game: BackendGameDetail }) {
  const [reqTab, setReqTab] = useState<"minimum" | "recommended">("minimum");
  const reqs = game.pcRequirements[reqTab] || "No requirements provided.";
  const languageRows = game.supportedLanguages
    .split(/,|<br>/)
    .map((entry) => entry.trim())
    .filter((entry) => entry && !entry.toLowerCase().includes("languages with full audio"))
    .map((entry) => ({
      name: entry.replace(/<[^>]+>/g, "").replace(/\*/g, "").trim(),
      fullAudio: entry.includes("<strong>*</strong>"),
    }))
    .slice(0, 12);

  return (
    <>
      {/* Genres */}
      {game.genres?.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
            Genres
          </p>
          <div className="flex flex-wrap gap-2">
            {game.genres.map((genre) => (
              <a
                key={genre.id}
                className="rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-on-surface-variant"
                href={`/games?genre=${genre.id}`}
              >
                {genre.description}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {game.categories?.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {game.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-on-surface-variant"
              >
                {cat.description}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
          Supported Languages
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Language</th>
              <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Interface</th>
              <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Audio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {languageRows.map(({ name, fullAudio }) => (
              <tr key={name} className="group">
                <td className="py-1.5 font-medium text-on-surface">{name}</td>
                <td className="py-1.5 text-center text-primary">✓</td>
                <td className="py-1.5 text-center">
                  {fullAudio
                    ? <span className="text-primary">✓</span>
                    : <span className="text-outline-variant/40">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Requirements */}
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
          System Requirements
        </p>
        <div className="mb-3 flex gap-1 rounded-lg bg-surface-container p-1">
          {(["minimum", "recommended"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setReqTab(tab)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${reqTab === tab
                ? "bg-surface-container-highest text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div
          className="text-sm text-on-surface-variant [&>strong]:mb-2 [&>strong]:block [&>strong]:text-[10px] [&>strong]:font-bold [&>strong]:uppercase [&>strong]:tracking-widest [&>strong]:text-primary [&_br]:hidden [&_li]:flex [&_li]:gap-2 [&_li]:py-0.5 [&_li]:before:shrink-0 [&_li]:before:text-primary [&_li]:before:content-['▸'] [&_li>strong]:font-semibold [&_li>strong]:text-on-surface [&_ul]:space-y-0.5"
          dangerouslySetInnerHTML={{ __html: reqs }}
        />
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
    </>
  );
}
