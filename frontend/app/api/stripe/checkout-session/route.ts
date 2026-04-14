import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const AUTH_URL = process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";

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

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userid = await getUserId(token);
  if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let amount: number;
  let returnUrl: string;
  try {
    const body = await req.json();
    amount = Number(body.amount);
    returnUrl = String(body.returnUrl ?? "");
    if (!Number.isInteger(amount) || amount < 100) {
      return NextResponse.json({ error: "amount must be an integer >= 100 (cents)" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const successUrl = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}topup=success`;
  const cancelUrl = returnUrl;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Wallet top-up" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        metadata: { userid: String(userid) },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Session error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
