import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoBanner } from "@/components/home/PromoBanner";
import { CategoryPillRow } from "@/components/home/CategoryPillRow";
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
  genres,
} from "@/lib/fake-data";

export default async function Home() {
  const [heroSlides, recommendedGames, bestsellerGames, newReleases, preOrders, dealTiers] =
    await Promise.all([
      getHeroSlides(),
      getRecommendedGames(),
      getBestsellerGames(),
      getNewReleases(),
      getPreOrders(),
      getDealTiers(),
    ]);

  return (
    <>
      <Header />
      <main>
        <HeroCarousel slides={heroSlides} />
        <PromoBanner />
        <CategoryPillRow genres={genres} />
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
