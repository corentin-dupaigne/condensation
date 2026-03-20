import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchHero } from "@/components/search/SearchHero";
import { SearchFilterBar } from "@/components/search/SearchFilterBar";
import { SearchResultsGrid } from "@/components/search/SearchResultsGrid";
import { PopularSearches } from "@/components/search/PopularSearches";
import { RecentlyViewedCarousel } from "@/components/search/RecentlyViewedCarousel";

import {
  searchResultGames,
  popularSearches,
  recentlyViewedGames,
} from "@/lib/fake-data";

export default function SearchPage() {
  return (
    <>
      <Header />
      <main>
        <SearchHero />
        <SearchFilterBar />
        <SearchResultsGrid games={searchResultGames} />
        <PopularSearches searches={popularSearches} />
        <RecentlyViewedCarousel games={recentlyViewedGames} />
      </main>
      <Footer />
    </>
  );
}
