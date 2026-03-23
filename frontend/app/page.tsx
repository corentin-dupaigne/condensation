export const dynamic = "force-dynamic";

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
} from "@/lib/game-data";

import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  let userName = null;

  if (token) {
    try {
      // Internally ping the backend Laravel API securely to pull the user profile
      const backendAuth = process.env.API_URL || process.env.AUTH_URL || 'http://localhost:8000';
      const res = await fetch(`${backendAuth}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const user = await res.json();
        userName = user.name;
      }
    } catch (e) {
      console.error("Failed to fetch user data", e);
    }
  }

  const isLoggedIn = !!token;

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
