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

Today is determined by the current date. Research the NEXT high school football game window in the DFW area, normally Thursday through Saturday.

GOAL:
Return the best 10-20 REAL, CURRENTLY SCHEDULED DFW-area high school football games for that upcoming week.

GEOGRAPHY:
Include Dallas, Fort Worth, Arlington, Mansfield, Duncanville, DeSoto, Cedar Hill, Lancaster, Waxahachie, Midlothian, Aledo, Southlake, Grapevine, Coppell, Lewisville, Denton, Prosper, Frisco, McKinney, Allen, Plano, Rockwall, Forney, Mesquite and nearby DFW programs. A notable opponent from outside DFW is allowed if the DFW team is playing them.

RESEARCH REQUIREMENTS:
1. Verify opponent, date and kickoff time from reliable current sources. Prefer MaxPreps, Dave Campbell's Texas Football, UIL/school/team schedule pages, local news and official athletics pages.
2. Research CURRENT team rankings/records and recent performance.
3. Research notable current college recruits on both rosters. Prioritize 5-star, 4-star, top-100 national prospects, Power-4 commits and major Power-4 offer lists.
4. Do not invent players, commitments, times, venues or games.
5. If a fact is uncertain, omit it rather than guessing.
6. Put source URLs used for each game in the sources array.

SCORING INPUTS:
Return four 0-100 component ratings. Do NOT calculate the final score.

Team Quality:
100 = matchup between two national/state powers.
90s = two top Texas/DFW contenders.
80s = strong playoff-caliber matchup.
Lower when one or both teams are ordinary.

Recruit Talent:
100 = extraordinary concentration of blue-chip recruits.
90s = several 4/5-star or major Power-4 recruits across both teams.
80s = multiple Power-4 prospects.
70s = some FBS talent.
Give this factor special attention.

Matchup Quality:
100 = elite teams expected to be very evenly matched.
Reduce heavily for likely blowouts.

Importance:
Reward ranked-vs-ranked, district implications, rivalry, playoffs, showcase games and major interstate matchups.

Sort mentally toward games a football/recruiting fan would actually want to attend.
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
    .sort((a,b) => b.gameScore - a.gameScore);

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
