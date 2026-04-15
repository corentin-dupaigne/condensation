"use client";

import { useState, useEffect } from "react";
import { createPlayer, videoFeatures } from "@videojs/react";
import { VideoSkin, Video } from "@videojs/react/video";
import "@videojs/react/video/skin.css";
import type { BackendGameDetail } from "@/lib/types";
import { formatPrice } from "@/lib/format-price";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { addToCart, cartItemFromGame, clearCart } from "@/lib/cart-store";
import { fetchBalance } from "@/lib/balance-store";
import { PaymentMethodModal } from "@/components/checkout/PaymentMethodModal";
import { useRouter } from "next/navigation";

type MediaItem =
  | { kind: "movie"; id: number; name: string; thumbnail: string; hls: string }
  | { kind: "screenshot"; id: number; thumbnail: string; full: string };

function ProductAddToCartButton({ game }: { game: BackendGameDetail }) {
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
          {game.name} has been added to the cart
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-container-high" />
        </div>
      )}
    </div>
  );
}

const HlsPlayer = createPlayer({ features: videoFeatures });

function VideoPlayer({ src, poster }: { src: string; poster: string }) {
  return (
    <HlsPlayer.Provider>
      <VideoSkin poster={poster}>
        <Video src={src} playsInline />
      </VideoSkin>
    </HlsPlayer.Provider>
  );
}

export function ProductHero({ game, isLoggedIn = false }: { game: BackendGameDetail; isLoggedIn?: boolean }) {
  const router = useRouter();
  const [keyCounts, setKeyCounts] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/steam/${game.id}/key_counts`)
      .then((r) => r.json())
      .then((data) => setKeyCounts(data.key_counts ?? null))
      .catch(() => {});
  }, [game.id]);

  const media: MediaItem[] = [
    ...(game.movies ?? []).slice(0, 2).map((m) => ({
      kind: "movie" as const,
      id: m.id,
      name: m.name,
      thumbnail: m.thumbnail,
      hls: m.hlsH264 ?? "",
    })),
    ...game.screenshots.slice(0, 8).map((s) => ({
      kind: "screenshot" as const,
      id: s.id,
      thumbnail: s.pathThumbnail,
      full: s.pathFull,
    })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedEdition, setSelectedEdition] = useState<"standard" | "deluxe">(
    "standard",
  );
  const active = media[activeIndex];

  const finalPrice = game.priceFinal / 100;
  const initialPrice = game.priceInitial / 100;
  const ageText = String(game.requiredAge || "E");
  const genreText =
    game.genres.length > 0
      ? game.genres.map((genre) => genre.description).join(" · ")
      : "N/A";

  async function handleBuyNowBalance() {
    setShowPaymentModal(false);
    setBalanceLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          games: [{ gameIds: game.id, quantity: 1 }],
        }),
      });
      if (!res.ok) {
        setBalanceLoading(false);
        return;
      }
      clearCart();
      await fetchBalance();
      router.push("/orders?purchase=success");
    } catch {
      setBalanceLoading(false);
    }
  }

  async function handleBuyNowStripe() {
    setShowPaymentModal(false);
    setStripeLoading(true);
    try {
      const res = await fetch("/api/stripe/game-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          games: [{ gameIds: game.id, quantity: 1 }],
          returnUrl: `${window.location.origin}/orders?purchase=success`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error();
      setStripeLoading(false);
      window.location.href = data.url;
    } catch {
      setStripeLoading(false);
    }
  }

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
                      : (game.headerImage ?? "")
                  }
                  alt={game.name}
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
                className={`m-2 relative min-w-28 aspect-video shrink-0 overflow-hidden rounded-lg transition-all ${i === activeIndex
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
                      : `${game.name} screenshot ${i + 1}`
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
                {game.name}
              </h1>
              <span className="shrink-0 rounded bg-surface-container-highest px-3 py-1 text-xs font-black uppercase">
                {ageText}
              </span>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant">
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
                className={`w-full text-right p-4 rounded-xl border transition-all group ${selectedEdition === "standard"
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
                      {game.reductionPercentage}%</span>
                  </div>
                  <div className="flex flex-col items-end h-full">
                    <span className="text-xl font-headline font-black text-secondary">
                      {formatPrice(finalPrice)}
                    </span>
                    {keyCounts !== null && (
                      <span className="text-xs text-on-surface-variant mt-4">
                        {keyCounts} keys left in stock
                      </span>
                    )}
                  </div>
                </div>

              </button>

              {/* Digital Deluxe */}
              <button
                onClick={() => setSelectedEdition("deluxe")}
                className={`w-full text-left p-4 rounded-xl border transition-all group ${selectedEdition === "deluxe"
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
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  router.push("/api/auth/login");
                  return;
                }
                setShowPaymentModal(true);
              }}
              disabled={balanceLoading || stripeLoading}
              className="w-full py-4 bg-linear-to-br from-secondary to-secondary-container text-on-secondary font-headline font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(161,250,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {balanceLoading || stripeLoading ? "Processing…" : "Buy Now"}
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
                {game.metacriticScore ?? 0}
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
                  Math.round((game.recommendationsTotal ?? 0) / 250),
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

      <PaymentMethodModal
        id="product-hero-payment-modal"
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={finalPrice}
        totalCents={game.priceFinal}
        lineItems={[{
          name: game.name,
          priceCents: game.priceFinal,
          quantity: 1,
        }]}
        onBalancePay={handleBuyNowBalance}
        onStripePay={handleBuyNowStripe}
      />
    </section>
  );
}
