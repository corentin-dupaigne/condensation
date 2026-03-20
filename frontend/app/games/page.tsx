import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { catalogGames, allPlatforms, allGenres } from "@/lib/fake-data";

export const metadata: Metadata = {
  title: "Catalog — Condensation",
  description: "Browse thousands of game keys at the best prices. Filter by platform, genre, and price.",
};

export default function CatalogPage() {
  return (
    <>
      <Header />
      <main>
        <CatalogClient
          games={catalogGames}
          platforms={allPlatforms}
          genres={allGenres}
        />
      </main>
      <Footer />
    </>
  );
}
