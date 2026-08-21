import { researchGames, saveGames } from "./_shared.mjs";

export default async (req) => {
  const expected = process.env.REFRESH_SECRET;
  const url = new URL(req.url);
  const supplied = req.headers.get("x-refresh-secret") || url.searchParams.get("key");

  if (expected && supplied !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = await researchGames();
    await saveGames(data);
    console.log(`Saved ${data.games.length} games for ${data.weekLabel}`);
  } catch (error) {
    console.error("Refresh failed:", error);
    throw error;
  }
};

export const config = {
  background: true,
  path: "/api/refresh"
};
