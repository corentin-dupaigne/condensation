import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-auth";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function GET() {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "Backend error" }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const token = await getAdminToken();
  if (!token) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/admin/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
