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

import { getGameBySlug, getRelatedGames } from "@/lib/fake-data";
import type { GameDetail } from "@/lib/types";

interface SteamAppData {
  name: string;
  detailed_description?: string;
  about_the_game?: string;
  supported_languages?: string;
  developers?: string[];
  publishers?: string[];
  genres?: { id: string; description: string }[];
  categories?: { id: number; description: string }[];
  platforms?: { windows: boolean; mac: boolean; linux: boolean };
  price_overview?: {
    currency?: string;
    initial?: number;
    final?: number;
    discount_percent?: number;
    initial_formatted?: string;
    final_formatted?: string;
  };
  screenshots?: { id: number; path_thumbnail: string; path_full: string }[];
  movies?: {
    id: number;
    name: string;
    thumbnail: string;
    dash_av1?: string;
    dash_h264?: string;
    hls_h264?: string;
    highlight: boolean;
  }[];
  pc_requirements?: { minimum?: string; recommended?: string };
  mac_requirements?: { minimum?: string; recommended?: string };
  linux_requirements?: { minimum?: string; recommended?: string };
  recommendations?: { total?: number };
  metacritic?: { score?: number };
  required_age?: number | string;
  header_image?: string;
  release_date?: { date: string };
}

async function fetchSteamAppDetails(appid: number): Promise<SteamAppData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/steam/${appid}`);
  if (!res.ok) return null;
  return res.json();
}

function steamDataToGameDetail(
  appData: SteamAppData,
  basePrice: number
): Partial<GameDetail> {
  return {
    detailed_description: appData.detailed_description ?? "",
    about_the_game: appData.about_the_game ?? "",
    supported_languages: appData.supported_languages ?? "English",
    developers: appData.developers ?? ["Unknown"],
    publishers: appData.publishers ?? ["Unknown"],
    releaseDate: appData.release_date?.date,
    genres: appData.genres ?? [],
    categories: appData.categories ?? [],
    platforms: appData.platforms ?? { windows: true, mac: false, linux: false },
    price_overview: {
      currency: appData.price_overview?.currency ?? "USD",
      initial: appData.price_overview?.initial ?? Math.round(basePrice * 100),
      final: appData.price_overview?.final ?? Math.round(basePrice * 100),
      discount_percent: appData.price_overview?.discount_percent ?? 0,
      initial_formatted: appData.price_overview?.initial_formatted ?? "",
      final_formatted:
        appData.price_overview?.final_formatted ?? `$${basePrice.toFixed(2)}`,
    },
    screenshots: appData.screenshots ?? [],
    movies: appData.movies ?? [],
    pc_requirements: appData.pc_requirements ?? {},
    mac_requirements: appData.mac_requirements,
    linux_requirements: appData.linux_requirements,
    recommendations_total: appData.recommendations?.total ?? 0,
    metacritic_score: appData.metacritic?.score ?? 0,
    required_age: appData.required_age ?? "",
    headerImage: appData.header_image,
  };
}

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

  const relatedGames = await getRelatedGames();

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
      <Header />
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
