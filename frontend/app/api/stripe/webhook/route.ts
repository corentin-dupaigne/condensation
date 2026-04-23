import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userid = Number(session.metadata?.userid);
    if (!Number.isInteger(userid) || userid <= 0) {
      console.error("Webhook: missing userid in session metadata", session.id);
      return NextResponse.json({ error: "Missing userid" }, { status: 400 });
    }

    const amountCents = session.amount_total ?? 0;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? session.id);

    if (session.metadata?.type === "game_purchase") {
      let games: Array<{ gameIds: number; quantity: number }>;
      try {
        games = JSON.parse(session.metadata.games ?? "[]");
        if (!Array.isArray(games) || games.length === 0) throw new Error("empty games");
      } catch (err) {
        console.error("Webhook: failed to parse games from session metadata", session.id, err);
        return NextResponse.json({ error: "Invalid games metadata" }, { status: 400 });
      }

      // Fund the wallet first so createOrder's balance check passes,
      // then the order creation deducts the same amount — net effect is zero.
      try {
        const balanceRes = await fetch(`${BACKEND_URL}/api/internal/balance`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Internal-Secret": INTERNAL_SECRET },
          body: JSON.stringify({ userid, amount: amountCents }),
        });
        if (!balanceRes.ok) {
          console.error("Webhook: backend POST /balance failed before order creation", balanceRes.status);
          return NextResponse.json({ error: "Backend error" }, { status: 500 });
        }
      } catch (err) {
        console.error("Webhook: backend unreachable when funding balance", err);
        return NextResponse.json({ error: "Backend unreachable" }, { status: 500 });
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid, games }),
        });
        if (!res.ok) {
          console.error("Webhook: backend POST /orders failed", res.status);
          return NextResponse.json({ error: "Backend error" }, { status: 500 });
        }
      } catch (err) {
        console.error("Webhook: backend unreachable when creating order", err);
        return NextResponse.json({ error: "Backend unreachable" }, { status: 500 });
      }
    } else {
      // Balance top-up
      try {
        const res = await fetch(`${BACKEND_URL}/api/internal/balance`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Internal-Secret": INTERNAL_SECRET },
          body: JSON.stringify({ userid, amount: amountCents }),
        });
        if (!res.ok) {
          console.error("Webhook: backend POST /balance failed", res.status);
          return NextResponse.json({ error: "Backend error" }, { status: 500 });
        }
      } catch (err) {
        console.error("Webhook: backend unreachable", err);
        return NextResponse.json({ error: "Backend unreachable" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
