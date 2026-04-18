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
import { faKey } from "@fortawesome/free-solid-svg-icons/faKey";

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
      .catch(() => { });
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
  const active = media[activeIndex];

  const finalPrice = game.priceFinal / 100;
  const initialPrice = game.priceInitial / 100;
  const savings = initialPrice - finalPrice;
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

          {/* Offer Card — our key price anchored against Steam retail */}
          <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faSteam} className="text-on-surface" />
                <span className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface">
                  Steam Key
                </span>
              </div>
              {game.reductionPercentage > 0 && (
                <span className="font-extrabold text-xs px-2.5 py-1 rounded-full bg-amber-300/10 border border-amber-300 text-amber-300">
                  −{game.reductionPercentage}%
                </span>
              )}
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Our price
                </span>
                <span className="text-3xl font-headline font-black text-secondary leading-none mt-1">
                  {formatPrice(finalPrice)}
                </span>
              </div>
              {initialPrice > finalPrice && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Steam retail
                  </span>
                  <span className="text-base font-headline font-bold text-on-surface-variant line-through leading-none mt-1">
                    {formatPrice(initialPrice)}
                  </span>
                </div>
              )}
            </div>

            {savings > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>You save {formatPrice(savings)} vs Steam</span>
              </div>
            )}

            {keyCounts !== null && (
              <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/20 text-sm text-on-surface-variant">
                <FontAwesomeIcon icon={faKey} />
                <span>
                  <span className="font-bold text-on-surface">{keyCounts}</span> keys left in stock
                </span>
              </div>
            )}
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
              className="w-full py-4 cta-gradient text-on-primary-fixed font-headline font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(161,250,255,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {balanceLoading || stripeLoading ? "Processing…" : "Buy Now"}
            </button>
            <div className="">
              <ProductAddToCartButton game={game} />
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
