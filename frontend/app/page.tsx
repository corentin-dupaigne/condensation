export const dynamic = "force-dynamic";

import { BestsellersSection } from "@/components/home/BestsellersSection";
import { BudgetDeals } from "@/components/home/BudgetDeals";
import { GameCardGrid } from "@/components/home/GameCardGrid";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { NewReleasesSection } from "@/components/home/NewReleasesSection";
import { PreOrdersSection } from "@/components/home/PreOrdersSection";
import { TrustBar } from "@/components/home/TrustBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

import {
  getBestsellerGames,
  getDealTiers,
  getNewReleases,
  getPreOrders,
  getRecommendedGames,
} from "@/lib/game-data";

import { getAuthState } from "@/lib/auth";

export default async function Home() {
  const { isLoggedIn, userName } = await getAuthState();

  // Retrieve our live dynamic dashboard data streams concurrently!
  const [
    recommendedGames,
    bestsellerGames,
    newReleases,
    preOrders,
    dealTiers,
  ] = await Promise.all([
    getRecommendedGames(),
    getBestsellerGames(),
    getNewReleases(),
    getPreOrders(),
    getDealTiers(),
  ]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <HeroCarousel />
        <GameCardGrid title="Recommended For You" games={recommendedGames} />
        <BestsellersSection games={bestsellerGames} />
        <NewReleasesSection games={newReleases} />
        <PreOrdersSection games={preOrders} />
        <BudgetDeals tiers={dealTiers} />
        <TrustBar />
      </main>
      <Footer />
    </>
  );
}
