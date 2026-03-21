export async function GET() {
  const res = await fetch(
    "https://store.steampowered.com/api/featuredcategories?cc=US&l=english",
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();
  return Response.json(data);
}
