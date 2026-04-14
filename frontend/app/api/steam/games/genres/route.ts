export async function GET() {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

  const res = await fetch(`${backendUrl}/api/games/genres`);
  if (!res.ok) {
    return Response.json({ error: "Failed to fetch genres" }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
