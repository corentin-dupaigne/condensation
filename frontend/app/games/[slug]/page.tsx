import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProductHero } from "@/components/product/ProductHero";
import { GameDescription } from "@/components/product/GameDescription";
import { RelatedGames } from "@/components/product/RelatedGames";
import { GameInfoSidebar } from "@/components/product/GameInfoSidebar";

import { getGameBySlug, getRelatedGames } from "@/lib/game-data";
import { fetchSteamAppDetails, steamDataToGameDetail } from "@/lib/steam-api";
import type { GameDetail } from "@/lib/types";
import { getAuthState } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getGameBySlug(slug);
  if (!result) return { title: "Game Not Found — Condensation" };
  return {
    title: `${result.game.title} — Condensation`,
    description: `Buy ${result.game.title} on Condensation. Best prices guaranteed.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getGameBySlug(slug);
  if (!result) notFound();

  const { game, steamAppId } = result;

  const steamData = await fetchSteamAppDetails(steamAppId);
  const steamDetails = steamData ? steamDataToGameDetail(steamData, game.price) : {};

  const gameDetail: GameDetail = {
    ...game,
    detailed_description: "No detailed description available.",
    about_the_game: "No game overview available.",
    supported_languages: "English",
    developers: ["Unknown"],
    publishers: ["Unknown"],
    categories: [],
    genres: [],
    platforms: {
      windows: true,
      mac: false,
      linux: false,
    },
    price_overview: {
      currency: "USD",
      initial: Math.round(game.price * 100),
      final: Math.round(game.price * 100),
      discount_percent: 0,
      initial_formatted: "",
      final_formatted: `$${game.price.toFixed(2)}`,
    },
    screenshots: [],
    pc_requirements: {},
    recommendations_total: 0,
    metacritic_score: 0,
    required_age: "",
    ...steamDetails,
  };

  const [relatedGames, { isLoggedIn, userName }] = await Promise.all([
    getRelatedGames(),
    getAuthState(),
  ]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Games", href: "/games" },
    ...(gameDetail.genres[0]?.description
      ? [
          {
            label: gameDetail.genres[0].description,
            href: `/games?genre=${gameDetail.genres[0].description.toLowerCase()}`,
          },
        ]
      : []),
    { label: gameDetail.title },
  ];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <ProductHero game={gameDetail} />

        <div className="mx-auto flex max-w-7xl gap-20 mb-8">
          <div className="w-2/3">
            <GameDescription
              title={gameDetail.title}
              detailedDescription={gameDetail.detailed_description}
              aboutTheGame={gameDetail.about_the_game}
            />
          </div>

          <div className="w-1/3">
            <GameInfoSidebar game={gameDetail} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-16">
          <RelatedGames games={relatedGames} />
        </div>
      </main>
      <Footer />
    </>
  );
}
