export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoBanner } from "@/components/home/PromoBanner";
import { GameCardGrid } from "@/components/home/GameCardGrid";
import { BestsellersSection } from "@/components/home/BestsellersSection";
import { NewReleasesSection } from "@/components/home/NewReleasesSection";
import { PreOrdersSection } from "@/components/home/PreOrdersSection";
import { BudgetDeals } from "@/components/home/BudgetDeals";
import { TrustBar } from "@/components/home/TrustBar";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";

import {
  getHeroSlides,
  getRecommendedGames,
  getBestsellerGames,
  getNewReleases,
  getPreOrders,
  getDealTiers,
} from "@/lib/game-data";

import { getAuthState } from "@/lib/auth";

export default async function Home() {
  const { isLoggedIn, userName } = await getAuthState();

  // Retrieve our live dynamic dashboard data streams concurrently!
  const [
    heroSlides,
    recommendedGames,
    bestsellerGames,
    newReleases,
    preOrders,
    dealTiers,
  ] = await Promise.all([
    getHeroSlides(),
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
        <HeroCarousel slides={heroSlides} />
        <PromoBanner />
        <GameCardGrid title="Recommended For You" games={recommendedGames} />
        <BestsellersSection games={bestsellerGames} />
        <NewReleasesSection games={newReleases} />
        <PreOrdersSection games={preOrders} />
        <BudgetDeals tiers={dealTiers} />
        <TrustBar />
        <NewsletterSignup />
      </main>
      <Footer />
    </>
  );
}
