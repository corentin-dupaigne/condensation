"use client";

import { useState } from "react";
import type { GameDetail } from "@/lib/types";

export function GameInfoSidebar({ game }: { game: GameDetail }) {
  const [reqTab, setReqTab] = useState<"minimum" | "recommended">("minimum");
  const reqs = game.pc_requirements[reqTab] || "No requirements provided.";
  const languageRows = game.supported_languages
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
              <span
                key={genre.id}
                className="rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-on-surface-variant"
              >
                {genre.description}
              </span>
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
        <table className="w-full text-xs">
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
        <div
          className="text-xs text-on-surface-variant [&>strong]:mb-2 [&>strong]:block [&>strong]:text-[10px] [&>strong]:font-bold [&>strong]:uppercase [&>strong]:tracking-widest [&>strong]:text-primary [&_br]:hidden [&_li]:flex [&_li]:gap-2 [&_li]:py-0.5 [&_li]:before:shrink-0 [&_li]:before:text-primary [&_li]:before:content-['▸'] [&_li>strong]:font-semibold [&_li>strong]:text-on-surface [&_ul]:space-y-0.5"
          dangerouslySetInnerHTML={{ __html: reqs }}
        />
        <div className="flex gap-2 pt-2">
          {game.platforms.windows && (
            <span className="flex items-center gap-1.5 rounded-full bg-surface-container-highest px-2.5 py-1 text-[10px] font-medium text-on-surface-variant">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.551H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              Windows
            </span>
          )}
          {game.platforms.mac && (
            <span className="flex items-center gap-1.5 rounded-full bg-surface-container-highest px-2.5 py-1 text-[10px] font-medium text-on-surface-variant">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              macOS
            </span>
          )}
          {game.platforms.linux && (
            <span className="flex items-center gap-1.5 rounded-full bg-surface-container-highest px-2.5 py-1 text-[10px] font-medium text-on-surface-variant">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.504 0c-.155 0-.315.008-.480.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.354 1.611-.332 2.181.026.593.114 1.038.222 1.378.198.659.468 1.059.68 1.098.28.048.4-.409.4-.409s.208-.83.328-1.412c.177-.854.422-1.764.927-2.699.328-.609.783-1.224 1.291-1.805.5-.573 1.061-1.113 1.57-1.702.508-.585.916-1.241 1.119-2.008.203-.765.194-1.638.197-2.516.008-1.645.151-3.426 1.33-4.17.546-.34 1.238-.453 1.964-.302.731.151 1.513.57 2.158 1.251.647.682 1.157 1.616 1.347 2.706.199 1.136.039 2.385-.414 3.504-.452 1.118-1.182 2.102-2.003 2.906-.819.804-1.722 1.416-2.434 2.034-.712.618-1.235 1.24-1.404 1.994-.165.754-.003 1.638.365 2.512.37.874.952 1.729 1.614 2.527 1.32 1.587 2.853 3.004 3.656 4.643.394.815.587 1.686.495 2.595-.092.91-.481 1.862-1.267 2.796-.786.935-1.961 1.841-3.486 2.558C8.28 23.647 6.263 24 4.118 24c-2.045 0-3.796-.356-5.107-.987-1.31-.632-2.177-1.543-2.484-2.626-.307-1.084-.047-2.325.586-3.498.633-1.173 1.598-2.278 2.684-3.199 1.086-.921 2.293-1.659 3.299-2.357.506-.349.966-.69 1.35-1.025.384-.334.69-.662.876-.988.186-.325.255-.647.215-.96-.04-.312-.19-.617-.455-.903-.532-.573-1.476-1.026-2.394-1.498-.919-.472-1.811-1.03-2.38-1.822-.57-.79-.818-1.826-.549-3.044.28-1.22 1.126-2.59 2.598-3.8C3.648 1.86 5.705.758 8.126.116A12.27 12.27 0 0 1 12.504 0z" />
              </svg>
              Linux
            </span>
          )}
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
    </>
  );
}
