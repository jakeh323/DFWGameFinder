import OpenAI from "openai";
import { getStore } from "@netlify/blobs";

export const STORE = "dfw-game-finder";
export const KEY = "current-week";

export function scoreGame(g) {
  return Math.round(
    g.teamQuality * 0.40 +
    g.recruitTalent * 0.35 +
    g.matchupQuality * 0.15 +
    g.importance * 0.10
  );
}

export async function researchGames() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["weekLabel", "games"],
    properties: {
      weekLabel: { type: "string" },
      games: {
        type: "array",
        minItems: 5,
        maxItems: 20,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "away","home","date","time","venue",
            "teamQuality","recruitTalent","matchupQuality","importance",
            "reason","notableRecruits","sources"
          ],
          properties: {
            away: { type: "string" },
            home: { type: "string" },
            date: { type: "string" },
            time: { type: "string" },
            venue: { type: "string" },
            teamQuality: { type: "integer", minimum: 0, maximum: 100 },
            recruitTalent: { type: "integer", minimum: 0, maximum: 100 },
            matchupQuality: { type: "integer", minimum: 0, maximum: 100 },
            importance: { type: "integer", minimum: 0, maximum: 100 },
            reason: { type: "string" },
            notableRecruits: {
              type: "array",
              items: { type: "string" },
              maxItems: 8
            },
            sources: {
              type: "array",
              items: { type: "string" },
              maxItems: 8
            }
          }
        }
      }
    }
  };

  const prompt = `
You are the data researcher for a Dallas-Fort Worth high school football game-ranking website.

Research the NEXT high school football game window in the DFW area, normally Thursday through Saturday.

Return the best 10-20 REAL, CURRENTLY SCHEDULED DFW-area high school football games for that upcoming week.

Include Dallas, Fort Worth, Arlington, Mansfield, Duncanville, DeSoto, Cedar Hill, Lancaster, Waxahachie, Midlothian, Aledo, Southlake, Grapevine, Coppell, Lewisville, Denton, Prosper, Frisco, McKinney, Allen, Plano, Rockwall, Forney, Mesquite and nearby DFW programs.

Requirements:
1. Verify opponent, date and kickoff time from reliable current sources.
2. Research current team rankings/records and recent performance.
3. Research notable current college recruits on both rosters.
4. Do not invent players, commitments, times, venues or games.
5. If a fact is uncertain, omit it rather than guessing.
6. Put source URLs used for each game in the sources array.

Scoring inputs:
- Team Quality: 0-100
- Recruit Talent: 0-100, heavily reward 4/5-star and Power-4 prospects
- Matchup Quality: 0-100
- Importance: 0-100

Do not calculate the final score.
`;

  const response = await client.responses.create({
    model: "gpt-5.4-mini",
    tools: [{ type: "web_search" }],
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "dfw_games",
        strict: true,
        schema
      }
    }
  });

  const parsed = JSON.parse(response.output_text);
  parsed.updatedAt = new Date().toISOString();
  parsed.sourceMode = "live";
  parsed.games = parsed.games
    .map(g => ({ ...g, gameScore: scoreGame(g) }))
    .sort((a, b) => b.gameScore - a.gameScore);

  return parsed;
}

export async function saveGames(data) {
  const store = getStore(STORE);
  await store.setJSON(KEY, data);
}

export async function loadGames() {
  const store = getStore(STORE);
  return await store.get(KEY, { type: "json", consistency: "strong" });
}
