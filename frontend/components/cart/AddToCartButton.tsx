"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";
import { addToCart, cartItemFromGame } from "@/lib/cart-store";

type Props = {
  game: Game;
  className?: string;
  children?: React.ReactNode;
  variant?: "icon" | "button";
};

export function AddToCartButton({
  game,
  className,
  children,
  variant = "icon",
}: Props) {
  const [justAdded, setJustAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      aria-label={`Add ${game.title} to cart`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(cartItemFromGame(game), 1);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 900);
      }}
    >
      {children ??
        (variant === "button" ? (
          <span className="inline-flex items-center gap-2">
            <span className="font-headline font-bold uppercase tracking-widest">
              {justAdded ? "Added" : "Add to Cart"}
            </span>
          </span>
        ) : (
          <svg
            width="14"
            height="14"
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
        ))}
    </button>
  );
}

