import { cookies } from "next/headers";

const AUTH_URL = process.env.API_URL ?? process.env.AUTH_URL ?? "http://localhost:8000";

/**
 * Returns the bearer token if the current session belongs to an admin user,
 * or null if the user is not authenticated or not an admin.
 */
export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${AUTH_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = await res.json();
    if (user?.role !== "admin") return null;
    return token;
  } catch {
    return null;
  }
}
