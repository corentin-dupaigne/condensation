const AUTH_URL = process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";

export async function getUserId(token: string): Promise<number | null> {
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
