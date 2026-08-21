import { loadGames, scoreGame } from "./_shared.mjs";
import seed from "../../seed.json" with { type: "json" };

export default async () => {
  try {
    let data = await loadGames();
    if (!data) {
      data = {
        ...seed,
        games: seed.games
          .map(g => ({ ...g, gameScore: scoreGame(g) }))
          .sort((a,b) => b.gameScore - a.gameScore)
      };
    }

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300"
      }
    });
  } catch (error) {
    const fallback = {
      ...seed,
      sourceMode: "seed-fallback",
      error: error.message,
      games: seed.games
        .map(g => ({ ...g, gameScore: scoreGame(g) }))
        .sort((a,b) => b.gameScore - a.gameScore)
    };
    return Response.json(fallback);
  }
};

export const config = { path: "/api/games" };
