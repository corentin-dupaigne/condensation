import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  getGameBySlug,
  getRelatedGames,
  deluxePerks,
  dlcItems,
  achievements,
} from "@/lib/fake-data";
import type { GameDetail, LanguageSupport, SystemRequirements } from "@/lib/types";

interface SteamAppData {
  name: string;
  short_description?: string;
  about_the_game?: string;
  developers?: string[];
  publishers?: string[];
  genres?: { id: string; description: string }[];
  categories?: { id: number; description: string }[];
  supported_languages?: string;
  metacritic?: { score: number };
  required_age?: number | string;
  price_overview?: { final: number };
  pc_requirements?: { minimum?: string; recommended?: string };
  header_image?: string;
  release_date?: { date: string };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseLanguages(raw: string): LanguageSupport[] {
  // Steam format: "English<strong>*</strong>, French<strong>*</strong>, ..."
  // asterisk = full audio support
  return raw
    .split(",")
    .slice(0, 6)
    .map((entry) => {
      const hasAudio = entry.includes("*") || entry.includes("<strong>");
      const language = stripHtml(entry).replace(/\*/g, "").trim();
      return { language, interface: true, audio: hasAudio, subtitles: true };
    })
    .filter((l) => l.language.length > 0);
}

function parseSystemRequirements(raw?: string): SystemRequirements {
  const fallback: SystemRequirements = {
    os: "Windows 10/11 64-bit",
    processor: "Intel Core i5 / Ryzen 5",
    memory: "8 GB RAM",
    graphics: "NVIDIA GeForce GTX 1060",
    storage: "50 GB SSD",
  };
  if (!raw) return fallback;
  const text = stripHtml(raw);
  const get = (label: string) => {
    const match = text.match(new RegExp(`${label}[:\\s]+([^\\n]+?)(?=\\s{2,}|$)`, "i"));
    return match?.[1]?.trim() ?? "";
  };
  return {
    os: get("OS") || fallback.os,
    processor: get("Processor") || fallback.processor,
    memory: get("Memory") || fallback.memory,
    graphics: get("Graphics") || fallback.graphics,
    storage: get("Storage") || fallback.storage,
  };
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
  const description = appData.short_description
    ? [appData.short_description]
    : appData.about_the_game
    ? [stripHtml(appData.about_the_game).slice(0, 500)]
    : ["No description available."];

  return {
    description,
    developer: appData.developers?.[0] ?? "Unknown",
    publisher: appData.publishers?.[0] ?? "Unknown",
    releaseDate: appData.release_date?.date,
    genres: appData.genres?.map((g) => g.description) ?? [],
    features: appData.categories?.map((c) => c.description.toUpperCase()) ?? [],
    languages: appData.supported_languages
      ? parseLanguages(appData.supported_languages)
      : [{ language: "English", interface: true, audio: true, subtitles: true }],
    metaScore: appData.metacritic?.score ?? 0,
    ageRating: appData.required_age ? `${appData.required_age}+` : "E Everyone",
    editionStandardPrice: basePrice,
    editionDeluxePrice: Math.round(basePrice * 1.75 * 100) / 100,
    systemRequirements: {
      minimum: parseSystemRequirements(appData.pc_requirements?.minimum),
      recommended: parseSystemRequirements(appData.pc_requirements?.recommended),
    },
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
    recommendedPercent: 90,
    description: ["No description available."],
    developer: "Unknown",
    publisher: "Unknown",
    features: [],
    languages: [{ language: "English", interface: true, audio: true, subtitles: true }],
    metaScore: 0,
    ageRating: "E Everyone",
    editionStandardPrice: game.price,
    editionDeluxePrice: Math.round(game.price * 1.75 * 100) / 100,
    systemRequirements: {
      minimum: {
        os: "Windows 10/11 64-bit",
        processor: "Intel Core i5 / Ryzen 5",
        memory: "8 GB RAM",
        graphics: "NVIDIA GeForce GTX 1060",
        storage: "50 GB SSD",
      },
      recommended: {
        os: "Windows 10/11 64-bit",
        processor: "Intel Core i7 / Ryzen 7",
        memory: "16 GB RAM",
        graphics: "NVIDIA GeForce RTX 3070",
        storage: "50 GB SSD",
      },
    },
    ...steamDetails,
  };

  const relatedGames = await getRelatedGames();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Games", href: "/games" },
    ...(gameDetail.genres[0]
      ? [{ label: gameDetail.genres[0], href: `/games?genre=${gameDetail.genres[0].toLowerCase()}` }]
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

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <GameDescription title={gameDetail.title} descriptions={gameDetail.description} />
            <DigitalDeluxePerks perks={deluxePerks} />
            <DLCSection items={dlcItems} />
            <AchievementsSection achievements={achievements} />
          </div>

          <GameInfoSidebar game={gameDetail} />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-16">
          <RelatedGames games={relatedGames} />
        </div>
      </main>
      <Footer />
    </>
  );
}
