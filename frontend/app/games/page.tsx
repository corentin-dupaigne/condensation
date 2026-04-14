import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import {
  getCatalogGames,
  getCatalogGamesByGenre,
  allGenres,
} from "@/lib/game-data";
import { getAuthState } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Catalog — Condensation",
  description:
    "Browse thousands of game keys at the best prices. Filter by platform, genre, and price.",
};

interface Props {
  searchParams: Promise<{ genre?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const { genre } = await searchParams;
  const genreId = genre ? parseInt(genre, 10) : null;

  const [gamesResult, { isLoggedIn, userName }] = await Promise.all([
    genreId !== null && !isNaN(genreId)
      ? getCatalogGamesByGenre(genreId)
      : getCatalogGames(),
    getAuthState(),
  ]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <CatalogClient
          games={gamesResult.games}
          genres={allGenres}
          activeGenreId={genreId ?? undefined}
          activeGenreLabel={gamesResult.genreLabel ?? undefined}
        />
      </main>
      <Footer />
    </>
  );
}
