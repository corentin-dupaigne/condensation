"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import type { GameDetail } from "@/lib/types";
import { formatPrice } from "@/lib/format-price";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { addToCart, cartItemFromGame } from "@/lib/cart-store";

type MediaItem =
  | { kind: "movie"; id: number; name: string; thumbnail: string; hls: string }
  | { kind: "screenshot"; id: number; thumbnail: string; full: string };

function ProductAddToCartButton({ game }: { game: GameDetail }) {
  const [justAdded, setJustAdded] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          addToCart(cartItemFromGame(game), 1);
          setJustAdded(true);
          window.setTimeout(() => setJustAdded(false), 2000);
        }}
        className="flex w-full items-center justify-center gap-2 py-3 bg-surface-container-highest text-on-surface font-headline font-bold uppercase text-sm rounded-xl hover:bg-surface-bright transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {justAdded ? "Added!" : "Add to Cart"}
      </button>

      {justAdded && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 animate-fade-in whitespace-nowrap rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-medium text-on-surface shadow-lg border border-outline-variant/20">
          {game.title} has been added to the cart
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-container-high" />
        </div>
      )}
    </div>
  );
}

function VideoPlayer({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "vjs-fill");
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      fluid: false,
      fill: true,
      responsive: true,
      poster,
      sources: [{ src, type: "application/x-mpegURL" }],
      controlBar: {
        pictureInPictureToggle: false,
      },
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster]);

  return <div ref={videoRef} className="h-full w-full" data-vjs-player />;
}

export function ProductHero({ game }: { game: GameDetail }) {
  const media: MediaItem[] = [
    ...(game.movies ?? []).slice(0, 2).map((m) => ({
      kind: "movie" as const,
      id: m.id,
      name: m.name,
      thumbnail: m.thumbnail,
      hls: m.hls_h264 ?? "",
    })),
    ...game.screenshots.slice(0, 8).map((s) => ({
      kind: "screenshot" as const,
      id: s.id,
      thumbnail: s.path_thumbnail,
      full: s.path_full,
    })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedEdition, setSelectedEdition] = useState<"standard" | "deluxe">(
    "standard",
  );
  const active = media[activeIndex];

  const finalPrice = (game.price_overview.final ?? 0) / 100;
  const initialPrice = (game.price_overview.initial ?? 0) / 100;
  const hasDiscount = game.price_overview.discount_percent > 0;
  const ageText = String(game.required_age || "E");
  const genreText =
    game.genres.length > 0
      ? game.genres.map((genre) => genre.description).join(" · ")
      : "N/A";

  return (
    <section className="mx-auto max-w-7xl mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left — Media Gallery */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-container-high group">
            {active?.kind === "movie" ? (
              <VideoPlayer src={active.hls} poster={active.thumbnail} />
            ) : (
              <>
                {/* External storefront media URLs are rendered directly here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    active?.kind === "screenshot"
                      ? active.full
                      : (game.image ?? "")
                  }
                  alt={game.title}
                  className="h-full w-full object-cover"
                />
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-2 h-[10vh]">
            {media.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(i)}
                className={`m-2 relative min-w-28 aspect-video shrink-0 overflow-hidden rounded-lg transition-all ${
                  i === activeIndex
                    ? "ring-2 ring-secondary ring-offset-2 ring-offset-surface"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt={
                    item.kind === "movie"
                      ? item.name
                      : `${game.title} screenshot ${i + 1}`
                  }
                  className="h-full w-full object-cover"
                />
                {item.kind === "movie" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-secondary"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Purchase Panel */}
        <div className="lg:col-span-4 space-y-8 sticky top-28">
          {/* Title + age rating */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold uppercase leading-tight tracking-tighter text-on-surface">
                {game.title}
              </h1>
              <span className="shrink-0 rounded bg-surface-container-highest px-3 py-1 text-xs font-black uppercase">
                {ageText}
              </span>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant">
              {game.platforms.windows && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 12V6.75l8-1.25V12H3zm0 .5h8v6.5l-8-1.25V12.5zM11.5 12V5.35l9.5-1.6V12H11.5zm0 .5H21v8.25l-9.5-1.6V12.5z" />
                </svg>
              )}
              {game.platforms.mac && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              )}
              {game.platforms.linux && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.368 1.884 1.43.585.047 1.042-.245 1.236-.645.545.533 1.32.622 2.093.547.339-.034.654-.128.915-.251.554-.252.889-.602.89-1.072 0-.259-.053-.494-.17-.649-.44-.587-1.164-.664-1.716-1.045-.364-.24-.609-.51-.846-.833-.15-.282-.255-.453-.32-.525-.291-.453-1.072-1.015-.987-1.595.05-.2.168-.349.32-.47.523-.334.826-.687.928-1.09.1-.398.01-.797-.153-1.231-.232-.631-.626-1.332-1.029-2.203-.357-.71-.632-1.434-.782-2.055-.074-.318-.126-.636-.133-.91a3.22 3.22 0 01.022-.652c.028-.207.09-.4.202-.516.347-.363.517-.742.605-1.122.072-.316.084-.647.049-.894l-.012-.074c-.04-.307-.095-.508-.035-.756.086-.344.316-.654.476-.804.158-.158.2-.346.2-.539 0-.174-.038-.323-.063-.384-.101-.3-.259-.408-.526-.597-.307-.21-.661-.443-.856-.857-.14-.292-.27-.682-.265-1.014.016-.329.209-.53.45-.667.235-.122.503-.179.739-.246l.053-.016c.226-.066.429-.143.599-.232.28-.187.5-.39.602-.592l.005-.009c.102-.177.137-.35.125-.484l-.006-.034c-.038-.327-.195-.489-.429-.63-.113-.068-.248-.126-.384-.18-.136-.037-.272-.14-.355-.22-.085-.094-.135-.2-.16-.327C15.18.075 13.786 0 12.504 0z" />
                </svg>
              )}
              <div className="w-px h-4 bg-outline-variant/30" />
              <span className="text-xs font-headline tracking-widest uppercase">
                {genreText}
              </span>
            </div>
          </div>

          {/* Edition Selector */}
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Standard Edition */}
              <button
                onClick={() => setSelectedEdition("standard")}
                className={`w-full text-right p-4 rounded-xl border transition-all group ${
                  selectedEdition === "standard"
                    ? "border-secondary/30 bg-secondary/5"
                    : "border-outline-variant/20 bg-surface-container-high hover:border-secondary/20"
                }`}
              >
                <div className="flex justify-between items-center mb-1 h-fit">
                  <div className="flex flex-col gap-2">
                    <span className="font-headline font-bold text-lg uppercase group-hover:text-secondary transition-colors">
                      Steam key
                    </span>
                    <span className="w-fit font-extrabold text-xs px-3 py-2 rounded-2xl border-amber-300 border-2 text-amber-300">
                    -15%</span>
                  </div>
                  <div className="flex flex-col items-end h-full">
                    {hasDiscount && (
                      <span className="text-xs line-through text-outline">
                        {formatPrice(initialPrice)}
                      </span>
                    )}
                    <span className="text-xl font-headline font-black text-secondary">
                      {formatPrice(finalPrice)}
                    </span>
                  </div>
                </div>
                
              </button>

              {/* Digital Deluxe */}
              <button
                onClick={() => setSelectedEdition("deluxe")}
                className={`w-full text-left p-4 rounded-xl border transition-all group ${
                  selectedEdition === "deluxe"
                    ? "border-primary/30 bg-primary/5"
                    : "border-outline-variant/20 bg-surface-container-high hover:border-primary/20"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="">
                    <FontAwesomeIcon icon={faSteam} />
                    <span className="ml-2 font-headline font-bold text-lg uppercase group-hover:text-primary transition-colors">
                      Steam price
                    </span>
                  </div>
                  <span className="text-xl font-headline font-black text-on-surface">
                    {formatPrice(
                      initialPrice,
                    )}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <button className="w-full py-4 bg-linear-to-br from-secondary to-secondary-container text-on-secondary font-headline font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(161,250,255,0.3)]">
              Buy Now
            </button>
            <div className="grid grid-cols-2 gap-3">
              <ProductAddToCartButton game={game} />
              <button className="flex items-center justify-center gap-2 py-3 bg-surface-container-highest text-on-surface font-headline font-bold uppercase text-sm rounded-xl hover:bg-surface-bright transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Wishlist
              </button>
            </div>
          </div>

          {/* Scores */}
          <div className="flex gap-4 items-center justify-center pt-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-headline font-black text-tertiary">
                {game.metacritic_score ?? 0}
              </span>
              <span className="text-[8px] uppercase tracking-widest text-on-surface-variant">
                Metascore
              </span>
            </div>
            <div className="w-px h-8 bg-outline-variant/30" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-headline font-black text-primary">
                {Math.min(
                  99,
                  Math.round((game.recommendations_total ?? 0) / 250),
                )}
                %
              </span>
              <span className="text-[8px] uppercase tracking-widest text-on-surface-variant">
                Recommended
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
