"use client";

import { useCallback } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: PriceRangeSliderProps) {
  const leftPercent = ((value[0] - min) / (max - min)) * 100;
  const rightPercent = ((value[1] - min) / (max - min)) * 100;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Math.min(Number(e.target.value), value[1] - 1);
      onChange([next, value[1]]);
    },
    [value, onChange],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Math.max(Number(e.target.value), value[0] + 1);
      onChange([value[0], next]);
    },
    [value, onChange],
  );

  return (
    <div className="py-4">
      <span className="font-headline text-xs font-semibold uppercase tracking-wider text-on-surface">
        Price Range
      </span>

      <div className="relative mt-4 h-1.5">
        <div className="absolute inset-0 rounded-full bg-surface-container-highest" />
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={handleMinChange}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(161,250,255,0.3)]"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={handleMaxChange}
          className="pointer-events-none absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(161,250,255,0.3)]"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant">
        <span>€{value[0].toFixed(0)}</span>
        <span>€{value[1].toFixed(0)}</span>
      </div>
    </div>
  );
}
