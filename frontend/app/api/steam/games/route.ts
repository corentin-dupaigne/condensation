export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const upstream = new URL(`${backendUrl}/api/games`);

  const genreId = searchParams.get("genreId");
  const page = searchParams.get("page");
  const size = searchParams.get("size");
  const search = searchParams.get("search");

  if (genreId !== null) upstream.searchParams.set("genreId", genreId);
  if (page !== null) upstream.searchParams.set("page", page);
  if (size !== null) upstream.searchParams.set("size", size);
  if (search !== null) upstream.searchParams.set("search", search);

  const res = await fetch(upstream.toString());
  if (!res.ok) {
    return Response.json({ error: "Failed to fetch games" }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
