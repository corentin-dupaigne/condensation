"use client";

import { useState, useRef, useEffect } from "react";
import type { SortOption } from "@/lib/types";

const sortLabels: Record<SortOption, string> = {
  bestselling: "Bestselling",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  newest: "Newest Arrivals",
  discount: "Biggest Discount",
};

const sortOptions: SortOption[] = [
  "bestselling",
  "price-asc",
  "price-desc",
  "newest",
  "discount",
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2 text-xs font-medium text-on-surface transition-colors hover:bg-surface-bright"
      >
        {sortLabels[value]}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 min-w-[200px] rounded-lg bg-surface-container-highest p-1 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                option === value
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-bright hover:text-on-surface"
              }`}
            >
              {sortLabels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
