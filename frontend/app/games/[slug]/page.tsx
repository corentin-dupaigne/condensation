import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProductHero } from "@/components/product/ProductHero";
import { GameDescription } from "@/components/product/GameDescription";
import { DigitalDeluxePerks } from "@/components/product/DigitalDeluxePerks";
import { DLCSection } from "@/components/product/DLCSection";
import { AchievementsSection } from "@/components/product/AchievementsSection";
import { RelatedGames } from "@/components/product/RelatedGames";
import { GameInfoSidebar } from "@/components/product/GameInfoSidebar";

import {
  cyberStellarDetail,
  deluxePerks,
  dlcItems,
  achievements,
  relatedGames,
} from "@/lib/fake-data";

export const metadata: Metadata = {
  title: "Cyber Stellar 2088 — Condensation",
  description:
    "Experience the neon-drenched future of tactical combat in the most anticipated RPG of the decade.",
};

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Games", href: "/games" },
  { label: "RPG", href: "/games?genre=rpg" },
  { label: "Cyber Stellar 2088" },
];

export default function ProductDetailPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <ProductHero game={cyberStellarDetail} />

        {/* Two-column content */}
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-10">
            <GameDescription descriptions={cyberStellarDetail.description} />
            <DigitalDeluxePerks perks={deluxePerks} />
            <DLCSection items={dlcItems} />
            <AchievementsSection achievements={achievements} />
          </div>

          {/* Right sidebar */}
          <GameInfoSidebar game={cyberStellarDetail} />
        </div>

        {/* Full-width related games */}
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <RelatedGames games={relatedGames} />
        </div>
      </main>
      <Footer />
    </>
  );
}
