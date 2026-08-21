import fs from "node:fs";
import path from "node:path";
import { loadGames, scoreGame } from "./_shared.mjs";

const seedPath = path.join(process.cwd(), "seed.json");

function readSeed() {
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  return {
    ...seed,
    games: seed.games
      .map(g => ({ ...g, gameScore: scoreGame(g) }))
      .sort((a, b) => b.gameScore - a.gameScore)
  };
}

export default async () => {
  try {
    const data = await loadGames();
    return Response.json(data || readSeed(), {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300"
      }
    });
  } catch (error) {
    const fallback = {
      ...readSeed(),
      sourceMode: "seed-fallback",
      error: error.message
    };
    return Response.json(fallback);
  }
};
