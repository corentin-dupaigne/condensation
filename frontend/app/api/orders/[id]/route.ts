import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserId } from "@/lib/server-auth";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userid = await getUserId(token);
  if (userid === null) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/${id}?userid=${userid}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
