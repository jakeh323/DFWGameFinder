import OpenAI from "openai";
import { getStore } from "@netlify/blobs";

export function scoreGame(g) {
  return Math.round(
    g.teamQuality * 0.40 +
    g.recruitTalent * 0.35 +
    g.matchupQuality * 0.15 +
    g.importance * 0.10
  );
}

export function seedWithScores(seed) {
  return {
    ...seed,
    games: seed.games.map(g => ({ ...g, gameScore: scoreGame(g) }))
      .sort((a,b)=>b.gameScore-a.gameScore)
  };
}

export async function loadSaved() {
  const store = getStore("dfw-game-finder");
  return await store.get("current-week", { type: "json", consistency: "strong" });
}

export async function saveSaved(data) {
  const store = getStore("dfw-game-finder");
  await store.setJSON("current-week", data);
}

export async function researchGames() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const schema = {
    type:"object",
    additionalProperties:false,
    required:["weekLabel","games"],
    properties:{
      weekLabel:{type:"string"},
      games:{
        type:"array",minItems:5,maxItems:20,
        items:{
          type:"object",additionalProperties:false,
          required:["away","home","date","time","venue","teamQuality","recruitTalent","matchupQuality","importance","reason","notableRecruits","sources"],
          properties:{
            away:{type:"string"},home:{type:"string"},date:{type:"string"},time:{type:"string"},venue:{type:"string"},
            teamQuality:{type:"integer",minimum:0,maximum:100},
            recruitTalent:{type:"integer",minimum:0,maximum:100},
            matchupQuality:{type:"integer",minimum:0,maximum:100},
            importance:{type:"integer",minimum:0,maximum:100},
            reason:{type:"string"},
            notableRecruits:{type:"array",items:{type:"string"},maxItems:8},
            sources:{type:"array",items:{type:"string"},maxItems:8}
          }
        }
      }
    }
  };

  const prompt = `
Research the next Thursday-Saturday Dallas-Fort Worth high school football slate.

Return the best 10-20 REAL scheduled games in or involving the DFW area.
Verify opponent, date and kickoff time with current reliable sources.
Research current team strength/rankings/records plus high-end college recruits.

Prioritize:
- 5-star and 4-star recruits
- top-100 national recruits
- Power-4 commits and major offer lists
- ranked-vs-ranked games
- elite but competitive matchups
- district/rivalry/playoff/showcase importance

Geography includes Dallas, Fort Worth, Arlington, Mansfield, Duncanville, DeSoto,
Cedar Hill, Lancaster, Waxahachie, Midlothian, Aledo, Southlake, Coppell,
Lewisville, Denton, Prosper, Frisco, McKinney, Allen, Plano, Rockwall, Forney,
Mesquite and nearby DFW programs.

Do not invent games, players, times or commitments.
If uncertain, omit the fact.
Return source URLs per game.

Return component scores only:
Team Quality 0-100
Recruit Talent 0-100
Matchup Quality 0-100
Importance 0-100
`;

  const r = await client.responses.create({
    model:"gpt-5.4-mini",
    tools:[{type:"web_search"}],
    input:prompt,
    text:{format:{type:"json_schema",name:"dfw_games",strict:true,schema}}
  });

  const data = JSON.parse(r.output_text);
  data.updatedAt = new Date().toISOString();
  data.sourceMode = "live";
  data.games = data.games.map(g=>({...g,gameScore:scoreGame(g)}))
    .sort((a,b)=>b.gameScore-a.gameScore);
  return data;
}
