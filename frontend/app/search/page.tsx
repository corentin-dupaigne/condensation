import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchHero } from "@/components/search/SearchHero";
import { SearchFilterBar } from "@/components/search/SearchFilterBar";
import { SearchResultsClient } from "@/components/search/SearchResultsClient";
import { PopularSearches } from "@/components/search/PopularSearches";

import { searchSteamGames } from "@/lib/steam-api";
import { popularSearches } from "@/lib/game-data";
import { getAuthState } from "@/lib/auth";

type Props = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    size?: string;
    genreId?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, size, genreId } = await searchParams;
  const query = q?.trim() ?? "";

  const [searchResult, { isLoggedIn, userName }] = await Promise.all([
    query
      ? searchSteamGames({
          search: query,
          size: size != null ? Number(size) : 100,
          genreId: genreId != null ? Number(genreId) : undefined,
        })
      : Promise.resolve({ total: 0, totalPages: 0, games: [] }),
    getAuthState(),
  ]);
  const { total, games } = searchResult;
  console.log("Games in SearchPage:", games);
  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <SearchHero query={query} total={total} />
        <SearchFilterBar />

        {games.length > 0 ? (
          <SearchResultsClient games={games} total={total} />
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
