export async function GET(
  _request: Request,
  { params }: { params: Promise<{ appid: string }> }
) {
  const { appid } = await params;
  const res = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=US&l=english`
  );
  const data = await res.json();
  const gameData = data[appid];
  if (!gameData?.success) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(gameData.data);
}
