import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DealsHero } from "@/components/deals/DealsHero";
import { FlashDeals } from "@/components/deals/FlashDeals";
import { WeeklyDeals } from "@/components/deals/WeeklyDeals";
import { ClearanceDeals } from "@/components/deals/ClearanceDeals";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { getDealsPageData } from "@/lib/game-data";

export const metadata: Metadata = {
  title: "Deals — Condensation",
  description:
    "Flash deals, weekly specials, and clearance prices on game keys. Save big on the best PC and console games.",
};

export default async function DealsPage() {
  const { flashDeals, weeklyDeals, clearanceDeals, flashDealsExpiry } =
    await getDealsPageData();

  return (
    <>
      <Header />
      <main>
        <DealsHero />
        <FlashDeals games={flashDeals} expiryDate={flashDealsExpiry} />
        <WeeklyDeals games={weeklyDeals} />
        <ClearanceDeals games={clearanceDeals} />
        <NewsletterSignup />
      </main>
      <Footer />
    </>
  );
}
