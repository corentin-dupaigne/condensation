import { cookies } from "next/headers";

export async function getAuthState(): Promise<{
  isLoggedIn: boolean;
  userName: string | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return { isLoggedIn: false, userName: null };
  }

  try {
    const backendAuth =
      process.env.API_URL || process.env.AUTH_URL || "http://localhost:8000";
    const res = await fetch(`${backendAuth}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type");
    if (res.ok && contentType?.includes("application/json")) {
      const user = await res.json();
      return { isLoggedIn: true, userName: user.name ?? null };
    }
  } catch (e) {
    console.error("Failed to fetch user data", e);
  }

  return { isLoggedIn: false, userName: null };
}
