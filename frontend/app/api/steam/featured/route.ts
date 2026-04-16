export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "20";

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(
      `${backendUrl}/api/feature?page=${page}&size=${size}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return new Response("Failed to fetch featured data", { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({}, { status: 503 });
  }
}
