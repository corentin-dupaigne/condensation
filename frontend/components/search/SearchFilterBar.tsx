"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const dropdowns = [
  { label: "Platform", hasIcon: true },
  { label: "Price Range", hasIcon: false },
  { label: "Product Type", hasIcon: false },
];

type Genre = { id: number; description: string };

export function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeGenreId = searchParams.get("genreId")
    ? Number(searchParams.get("genreId"))
    : null;

  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    fetch("/api/steam/games/genres")
      .then((r) => r.json())
      .then((data) => setGenres(data.genres ?? []));
  }, []);

  function toggleGenre(id: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeGenreId === id) {
      params.delete("genreId");
    } else {
      params.set("genreId", String(id));
    }
    router.push(`/search?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("genreId");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-6">
      <div className="flex flex-wrap items-center gap-3">
        {dropdowns.map((d) => (
          <button
            key={d.label}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-on-surface-variant hover:text-on-surface"
          >
            {d.hasIcon && (
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
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="8" cy="6" r="2" fill="currentColor" />
                <circle cx="16" cy="12" r="2" fill="currentColor" />
                <circle cx="10" cy="18" r="2" fill="currentColor" />
              </svg>
            )}
            {d.label}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        ))}

        {genres.map((genre) => {
          const active = activeGenreId === genre.id;
          return (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {genre.description}
            </button>
          );
        })}

        {activeGenreId !== null && (
          <button
            onClick={clearAll}
            className="ml-auto text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Clear All
          </button>
        )}
      </div>
    </section>
  );
}
