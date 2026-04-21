"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

/* ── Static slide data (Steam IDs: 3681010, 1245620, 3240220, 2399830, 3764200) ── */

interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  genres: string[];
  ctaLink: string;
  image: string;
  accentFrom: string;
  accentTo: string;
}

const slides: HeroSlideData[] = [
  {
    id: "368",
    title: "Nioh 3",
    subtitle:
      "Use both Samurai and Ninja combat styles in the third dark samurai action RPG.",
    price: 22.39,
    genres: ["Action", "RPG"],
    ctaLink: "/games/368",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3681010/8c9333bf3f28194cb8113af455ecaf1aa45a0050/ss_8c9333bf3f28194cb8113af455ecaf1aa45a0050.1920x1080.jpg?t=1772090941",
    accentFrom: "#6b1010",
    accentTo: "#1a0505",
  },
  {
    id: "6",
    title: "ELDEN RING",
    subtitle:
      "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
    price: 34.79,
    genres: ["Action", "RPG"],
    ctaLink: "/games/6",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_943bf6fe62352757d9070c1d33e50b92fe8539f1.1920x1080.jpg?t=1767883716",
    accentFrom: "#744106",
    accentTo: "#1a1205",
  },
  {
    id: "29",
    title: "Grand Theft Auto V Enhanced",
    subtitle:
      "Experience the blockbuster — now upgraded with stunning visuals for a new generation.",
    price: 16.49,
    genres: ["Action", "Adventure", "Racing"],
    ctaLink: "/games/29",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3240220/8340fd391012e12be7e4c02e65801a2648a6b60e/ss_8340fd391012e12be7e4c02e65801a2648a6b60e.1920x1080.jpg?t=1765479644",
    accentFrom: "#051a36",
    accentTo: "#051a0a",
  },
  {
    id: "19",
    title: "ARK: Survival Ascended",
    subtitle:
      "Reimagined from the ground-up with Unreal Engine 5. Form a tribe, tame & breed hundreds of dinosaurs.",
    price: 24.29,
    genres: ["Action", "Adventure", "Survival"],
    ctaLink: "/games/19",
    image:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2399830/ss_83fdbd71f7c8480bcfa3ea649d0e2f0bd338c3d8.1920x1080.jpg?t=1766710980",
    accentFrom: "#1a3a0a",
    accentTo: "#0a1a05",
  },
  {
    id: "45",
    title: "Resident Evil Requiem",
    subtitle:
      "Requiem for the dead. Nightmare for the living. Prepare to escape death.",
    price: 59.49,
    genres: ["Action", "Adventure"],
    ctaLink: "/games/45",
    image:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3764200/08af4e9398b8e45152bfbedce3bc24d22e2c0990/ss_08af4e9398b8e45152bfbedce3bc24d22e2c0990.1920x1080.jpg?t=1772587704",
    accentFrom: "#2a0a25",
    accentTo: "#0a0510",
  },
];

/* ── Reduced motion hook ── */

const motionQuery = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(motionQuery);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
}

/* ── Format helpers ── */

function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `€${price.toFixed(2)}`;
}

/* ── Auto-advance interval (ms) ── */
const INTERVAL = 6000;

/* ── Component ── */

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const progressRef = useRef<HTMLDivElement>(null);

  const goto = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  /* Auto-advance */
  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next, paused, reducedMotion]);

  /* Progress bar animation reset */
  useEffect(() => {
    const el = progressRef.current;
    if (!el || reducedMotion) return;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  }, [current, reducedMotion]);

  /* Keyboard navigation */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    },
    [prev, next],
  );

  const slide = slides[current];

  return (
    <section
      className="relative h-[70vh] w-full overflow-hidden bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={onKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured games"
    >
      {/* Background slides with crossfade */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 ${reducedMotion ? "" : "transition-opacity duration-700 ease-out"}`}
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {/* Background image */}
          <Image
            src={s.image}
            alt=""
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
            draggable={false}
          />
          {/* Multi-layer gradient overlay for depth */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to right, ${s.accentFrom}ee 0%, ${s.accentFrom}88 35%, transparent 70%),
                linear-gradient(to top, #0c0e11 0%, #0c0e11aa 15%, transparent 50%),
                linear-gradient(135deg, ${s.accentFrom}66 0%, transparent 60%)
              `,
            }}
          />
        </div>
      ))}

      {/* Content overlay */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-16 lg:items-center lg:pb-0">
        <div
          className={`max-w-xl space-y-5 ${reducedMotion ? "" : "transition-all duration-500 ease-out"}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${current + 1} of ${slides.length}: ${slide.title}`}
        >
          {/* Genre tags */}
          <div className="flex flex-wrap items-center gap-2">
            {slide.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
              >
                {genre}
              </span>
            ))}
            {slide.discountPercent && (
              <span className="rounded-md bg-tertiary-container px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-on-tertiary">
                -{slide.discountPercent}%
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-headline text-4xl font-bold leading-[1.1] tracking-tight text-on-surface sm:text-5xl lg:text-6xl uppercase">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base leading-relaxed text-white/90 sm:text-lg">
            {slide.subtitle}
          </p>

          {/* Price + CTA row */}
          <div className="flex items-center gap-5 pt-1">
            <Link
              href={slide.ctaLink}
              className="group relative inline-flex items-center gap-2.5 rounded-xl cta-gradient px-7 py-3.5 font-headline text-md font-bold text-on-primary-fixed transition-all duration-200 ease-out hover:brightness-110 active:scale-[0.97] cursor-pointer"
            >
              BUY NOW
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${reducedMotion ? "" : "transition-transform duration-200 group-hover:translate-x-0.5"}`}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="flex items-baseline gap-2.5">
              {slide.originalPrice && (
                <span className="text-sm font-medium text-on-surface-variant line-through">
                  {formatPrice(slide.originalPrice)}
                </span>
              )}
              <span className="font-headline text-2xl font-bold text-on-surface">
                {formatPrice(slide.price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows (desktop) */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/30 p-3 text-on-surface-variant backdrop-blur-sm transition-colors duration-200 hover:bg-black/50 hover:text-on-surface lg:flex cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/30 p-3 text-on-surface-variant backdrop-blur-sm transition-colors duration-200 hover:bg-black/50 hover:text-on-surface lg:flex cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dot navigation */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goto(i)}
            aria-label={`Go to slide ${i + 1}: ${s.title}`}
            aria-current={i === current ? "true" : undefined}
            className="group relative flex h-5 cursor-pointer items-center justify-center"
          >
            <div
              className={`h-2 rounded-full transition-all duration-300 ${i === current
                ? "w-16 bg-primary"
                : "w-8 bg-white/30 group-hover:bg-white/50"
                }`}
            >
              {/* Progress fill on active dot */}
              {i === current && !reducedMotion && !paused && (
                <div
                  ref={progressRef}
                  className="h-full rounded-full bg-primary brightness-150"
                  style={{
                    animation: `hero-progress ${INTERVAL}ms linear forwards`,
                  }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Progress bar animation keyframes */}
      <style>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
