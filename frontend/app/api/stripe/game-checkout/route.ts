import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const AUTH_URL = process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function getUserId(token: string): Promise<number | null> {
  try {
    const res = await fetch(`${AUTH_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = await res.json();
    return typeof user.id === "number" ? user.id : null;
  } catch {
    return null;
  }
}

interface GameEntry {
  gameIds: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userid = await getUserId(token);
  if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let games: GameEntry[];
  let returnUrl: string;
  try {
    const body = await req.json();
    if (!Array.isArray(body.games) || body.games.length === 0) {
      return NextResponse.json({ error: "games must be a non-empty array" }, { status: 400 });
    }
    games = body.games as GameEntry[];
    returnUrl = String(body.returnUrl ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Build Stripe line items from game entries
  const lineItems: Array<{
    price_data: { currency: string; product_data: { name: string }; unit_amount: number };
    quantity: number;
  }> = [];
  for (const entry of games) {
    const gameId = Number(entry.gameIds);
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return NextResponse.json({ error: "Invalid game id" }, { status: 400 });
    }
    const quantity = Number(entry.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Fetch game details to get name and price
    let gameName: string;
    let gamePrice: number;
    try {
      const gameRes = await fetch(`${BACKEND_URL}/api/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!gameRes.ok) {
        return NextResponse.json({ error: "Game not found" }, { status: 400 });
      }
      const gameData = await gameRes.json();
      gameName = gameData.name ?? `Game #${gameId}`;
      gamePrice = Number(gameData.priceFinal);
      if (!Number.isInteger(gamePrice) || gamePrice <= 0) {
        return NextResponse.json({ error: "Game not found" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
    }

    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: { name: gameName },
        unit_amount: gamePrice,
      },
      quantity,
    });
  }

  // success_url: append purchase=success
  const successUrl =
    `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}purchase=success`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      metadata: {
        userid: String(userid),
        type: "game_purchase",
        games: JSON.stringify(games.map((g) => ({ gameIds: g.gameIds, quantity: g.quantity }))),
      },
      payment_intent_data: {
        metadata: { userid: String(userid), type: "game_purchase" },
      },
      success_url: successUrl,
      cancel_url: returnUrl,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe game-checkout session error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
