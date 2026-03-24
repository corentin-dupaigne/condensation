"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import type { GameDetail } from "@/lib/types";

type MediaItem =
  | { kind: "movie"; id: number; name: string; thumbnail: string; hls: string }
  | { kind: "screenshot"; id: number; thumbnail: string; full: string };

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VideoPlayer({ src, poster }: { src: string; poster: string }) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (playing) {
      hideTimeout.current = setTimeout(() => setControlsVisible(false), 2500);
    }
  }, [playing]);

  const stopAndShowControls = useCallback(() => {
    setPlaying(false);
    setControlsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((p) => {
      if (p) {
        setControlsVisible(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
      }
      return !p;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const seekToFraction = (fraction: number) => {
    const video = playerRef.current;
    if (video && video.duration > 0) {
      video.currentTime = fraction * video.duration;
    }
    setPlayed(fraction);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    seekToFraction(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setSeeking(true);
    handleProgressClick(e);
  };

  useEffect(() => {
    if (!seeking) return;
    const onMove = (e: MouseEvent) => {
      const bar = progressRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      seekToFraction(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };
    const onUp = () => setSeeking(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [seeking]);

  const showOverlay = controlsVisible || !playing;

  return (
    <div
      ref={containerRef}
      className="group/player relative h-full w-full cursor-pointer bg-black"
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      <ReactPlayer
        ref={playerRef}
        src={src}
        playing={playing}
        muted={muted}
        poster={poster}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (!seeking && v.duration > 0) setPlayed(v.currentTime / v.duration);
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onEnded={stopAndShowControls}
      />

      {/* Buffering spinner */}
      {buffering && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        </div>
      )}

      {/* Centre play/pause click zone */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center"
        onClick={togglePlaying}
      >
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm ring-1 ring-white/20 transition-all duration-200 hover:scale-110 ${
            showOverlay ? "opacity-100" : "opacity-0"
          }`}
        >
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
      </div>

      {/* Bottom control bar */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 transition-all duration-200 ${
          showOverlay ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="group/slider pointer-events-auto mb-2 flex h-4 w-full cursor-pointer items-center"
          onMouseDown={handleProgressMouseDown}
          onClick={handleProgressClick}
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-all duration-150 group-hover/slider:h-1.5">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${played * 100}%` }}
            />
          </div>
        </div>

        {/* Controls row */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlaying}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/80 transition-colors hover:text-white"
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Mute */}
          <button
            onClick={() => setMuted((m) => !m)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/80 transition-colors hover:text-white"
          >
            {muted ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>

          {/* Time */}
          <div className="flex items-center gap-1 text-[10px] text-white/70">
            <span>{formatTime(played * duration)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex-1" />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/80 transition-colors hover:text-white"
          >
            {fullscreen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
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
  const active = media[activeIndex];

  const finalPrice = (game.price_overview.final ?? 0) / 100;
  const ageText = String(game.required_age || "E");
  const genreText =
    game.genres.length > 0
      ? game.genres.map((genre) => genre.description).join(" · ")
      : "N/A";


  return (
    <section className="mx-auto flex max-w-7xl gap-8 mb-12">
      {/* Left — Media */}
      <div className="flex flex-col gap-3 w-2/3">
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-linear-to-br from-[#0a2a3a] via-[#0f3040] to-[#162530]">
          {active?.kind === "movie" ? (
            <VideoPlayer src={active.hls} poster={active.thumbnail} />
          ) : (
            <img
              src={active?.kind === "screenshot" ? active.full : (game.image ?? "")}
              alt={game.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute bottom-4 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-primary/60 to-transparent pointer-events-none" />
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-video h-14 shrink-0 overflow-hidden rounded-md transition-all ${
                i === activeIndex
                  ? "ring-2 ring-primary"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={item.thumbnail}
                alt={item.kind === "movie" ? item.name : `${game.title} screenshot ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {item.kind === "movie" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right — Purchase Panel */}
      <div className="flex w-1/3 flex-col gap-8">
        {/* Title + age rating */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-bold uppercase leading-none tracking-tight text-on-surface">
              {game.title}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-wider text-on-surface-variant">
              {genreText}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-surface-container-highest px-2 py-1 text-center text-[10px] font-bold uppercase leading-tight text-on-surface-variant">
            {ageText}
          </span>
        </div>

        {/* Pricing from API */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
            Price
          </p>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-high px-4 py-3">
            <span className="text-sm font-bold text-on-surface">Standard Edition</span>
            <span className="text-lg font-bold text-on-surface">
              ${finalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-container py-3.5 text-sm font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90">
          Buy Now
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/20 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Add to Cart
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/20 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:border-primary/40 hover:text-on-surface">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            Wishlist
          </button>
        </div>

        {/* Scores */}
        <div className="flex items-center justify-between gap-0 pt-2">
          {/* Metacritic */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-fit items-center justify-center rounded-lg bg-surface-container-highest px-3">
              <span className="text-xl font-bold text-primary">
                {game.metacritic_score ?? 0}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Metacritic
            </span>
          </div>

          {/* Recommended */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-fit items-center justify-center rounded-lg bg-surface-container-highest px-3">
              <span className="text-xl font-bold text-tertiary">
                {Math.min(99, Math.round((game.recommendations_total ?? 0) / 250))}%
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Recommended
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between gap-20">
            <span className="shrink-0 text-on-surface-variant">Developer</span>
            <span className="truncate text-right font-medium text-on-surface">{game.developers.join(", ")}</span>
          </div>
          <div className="flex justify-between gap-20">
            <span className="shrink-0 text-on-surface-variant">Publisher</span>
            <span className="truncate text-right font-medium text-on-surface">{game.publishers.join(", ")}</span>
          </div>
          <div className="flex justify-between gap-20">
            <span className="shrink-0 text-on-surface-variant">Release Date</span>
            <span className="truncate text-right font-medium text-on-surface">{game.releaseDate}</span>
          </div>
          <div className="flex justify-between gap-20">
            <span className="shrink-0 text-on-surface-variant">Genre</span>
            <div className="flex flex-wrap justify-end gap-1">
              {game.genres.length > 0 ? (
                game.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-medium text-on-surface-variant"
                  >
                    {genre.description}
                  </span>
                ))
              ) : <span className="font-medium text-on-surface">N/A</span>}
            </div>
          </div>
          <div className="flex justify-between gap-20">
            <span className="shrink-0 text-on-surface-variant">Categories</span>
            <div className="flex flex-wrap justify-end gap-1">
              {game.categories.length > 0 ? (
                <>
                  {game.categories.slice(0, 5).map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-medium text-on-surface-variant"
                    >
                      {category.description}
                    </span>
                  ))}
                  {game.categories.length > 5 && (
                    <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
                      +{game.categories.length - 5} more
                    </span>
                  )}
                </>
              ) : <span className="font-medium text-on-surface">N/A</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
