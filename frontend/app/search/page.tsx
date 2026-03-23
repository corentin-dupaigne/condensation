import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchHero } from "@/components/search/SearchHero";
import { SearchFilterBar } from "@/components/search/SearchFilterBar";
import { SearchResultsGrid } from "@/components/search/SearchResultsGrid";
import { PopularSearches } from "@/components/search/PopularSearches";

import { searchSteamGames } from "@/lib/steam-api";
import { popularSearches } from "@/lib/game-data";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const { total, games } = query
    ? await searchSteamGames(query)
    : { total: 0, games: [] };

  return (
    <>
      <Header />
      <main>
        <SearchHero query={query} total={total} />
        <SearchFilterBar />

        {games.length > 0 ? (
          <SearchResultsGrid games={games} />
        ) : query ? (
          <div className="mx-auto max-w-7xl px-6 py-16 text-center">
            <p className="font-headline text-lg font-semibold uppercase tracking-wide text-on-surface-variant">
              No results found for &lsquo;{query}&rsquo;
            </p>
            <p className="mt-2 text-sm text-on-surface-variant/60">
              Try a different search term.
            </p>
          </div>
        ) : (
          <PopularSearches searches={popularSearches} />
        )}
      </main>
      <Footer />
    </>
  );
}
