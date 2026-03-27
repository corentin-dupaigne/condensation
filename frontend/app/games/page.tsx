import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { getCatalogGames, allPlatforms, allGenres } from "@/lib/game-data";
import { getAuthState } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Catalog — Condensation",
  description:
    "Browse thousands of game keys at the best prices. Filter by platform, genre, and price.",
};

export default async function CatalogPage() {
  const [games, { isLoggedIn, userName }] = await Promise.all([
    getCatalogGames(),
    getAuthState(),
  ]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <CatalogClient
          games={games}
          platforms={allPlatforms}
          genres={allGenres}
        />
      </main>
      <Footer />
    </>
  );
}
