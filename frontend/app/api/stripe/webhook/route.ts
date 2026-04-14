import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

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

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const userid = Number(intent.metadata?.userid);
    const amount = intent.amount; // cents
    const payment_intent_id = intent.id;

    if (!Number.isInteger(userid) || userid <= 0) {
      console.error("Webhook: missing userid in metadata", intent.id);
      return NextResponse.json({ error: "Missing userid" }, { status: 400 });
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, amount, payment_intent_id }),
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

  return NextResponse.json({ received: true });
}
