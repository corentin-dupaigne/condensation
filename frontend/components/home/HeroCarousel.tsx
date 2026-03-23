"use client";

import { useState, useEffect, useCallback } from "react";
import type { HeroSlide } from "@/lib/types";
import { formatPrice } from "@/lib/format-price";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, paused, reducedMotion]);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden h-[60vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`relative flex h-full items-center ${reducedMotion ? "" : "transition-colors duration-700"}`}
        style={{
          background: `linear-gradient(135deg, ${slide.gradientFrom} 0%, ${slide.gradientTo} 50%, #0c0e11 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/40 to-transparent" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-16">
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="rounded bg-secondary/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-secondary">
                Featured
              </span>
              <div className="flex gap-1.5 text-on-surface-variant">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="m8 21 4-4 4 4" /></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
              </div>
            </div>

            <h1 className="font-headline text-5xl font-bold leading-tight tracking-tight text-on-surface lg:text-6xl">
              {slide.title}
            </h1>

            <p className="text-lg leading-relaxed text-on-surface-variant">
              {slide.subtitle}
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm text-on-surface-variant">Starting at</span>
              <span className="font-headline text-2xl font-bold text-on-surface">
                {formatPrice(slide.price)}
              </span>
            </div>

            <a
              href={slide.ctaLink}
              className="inline-block rounded-xl bg-cta px-8 py-3.5 font-headline text-sm font-bold text-on-cta transition-opacity hover:opacity-90"
            >
              {slide.ctaText}
            </a>
          </div>

          <div className="hidden w-100 lg:block">
            {slide.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.image}
                alt={slide.title}
                width={400}
                height={225}
                className="aspect-video w-full rounded-2xl object-cover opacity-80"
              />
            ) : (
              <div className="aspect-3/4 rounded-2xl bg-linear-to-br from-surface-container-highest via-surface-bright to-surface-container opacity-60" />
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === current
                ? "w-8 bg-primary"
                : "w-4 bg-on-surface-variant/30 hover:bg-on-surface-variant/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
