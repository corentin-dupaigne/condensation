import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartPageClient } from "@/components/cart/CartPageClient";
import { getRecommendedGames } from "@/lib/game-data";
import { getAuthState } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Cart — Condensation",
  description: "Review your cart and proceed to checkout.",
};

export default async function CartPage() {
  const [recommendedGames, { isLoggedIn, userName }] = await Promise.all([
    getRecommendedGames(),
    getAuthState(),
  ]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <CartPageClient recommendedGames={recommendedGames} isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </>
  );
}

