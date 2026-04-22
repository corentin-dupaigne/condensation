import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProductHero } from "@/components/product/ProductHero";
import { GameDescription } from "@/components/product/GameDescription";
import { RelatedGames } from "@/components/product/RelatedGames";
import { GameInfoSidebar } from "@/components/product/GameInfoSidebar";
import { fetchSteamAppDetails } from "@/lib/steam-api";
import { getRelatedGames } from "@/lib/game-data";
import type { BackendGameDetail } from "@/lib/types";
import { getAuthState } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const appid = Number(id);
  if (isNaN(appid)) return { title: "Game Not Found — Condensation" };
  const data = await fetchSteamAppDetails(appid);
  if (!data) return { title: "Game Not Found — Condensation" };
  return {
    title: `${data.name} — Condensation`,
    description: `Buy ${data.name} on Condensation. Best prices guaranteed.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const appid = Number(id);
  if (isNaN(appid)) notFound();

  const [steamData, { isLoggedIn, userName, isAdmin }] = await Promise.all([
    fetchSteamAppDetails(appid),
    getAuthState(),
  ]);

  if (!steamData) notFound();

  const firstGenreId = steamData.genres[0]?.id;
  const relatedGames = firstGenreId
    ? await getRelatedGames(firstGenreId, steamData.id)
    : [];

  const game: BackendGameDetail = steamData;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Games", href: "/games" },
    ...(game.genres[0]?.id
      ? [
        {
          label: game.genres[0].description,
          href: `/games?genre=${game.genres[0].id}`,
        },
      ]
      : []),
    { label: game.name },
  ];

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} isAdmin={isAdmin} />
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <ProductHero game={game} isLoggedIn={isLoggedIn} />

        <div className="mx-auto flex max-w-7xl gap-20 mb-8">
          <div className="w-2/3">
            <GameDescription
              title={game.name}
              detailedDescription={game.detailedDescription}
              aboutTheGame={game.aboutTheGame}
            />
          </div>

          <div className="w-1/3">
            <GameInfoSidebar game={game} />
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
