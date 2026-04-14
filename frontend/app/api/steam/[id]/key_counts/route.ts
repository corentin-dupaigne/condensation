export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const res = await fetch(`${backendUrl}/api/games/${id}/key_counts`);
  if (!res.ok) {
    return Response.json({ error: "Not found" }, { status: res.status });
  }
  const data = await res.json();
  return Response.json(data);
}
