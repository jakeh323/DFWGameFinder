import json
import os
from datetime import datetime, timezone
from pathlib import Path
from openai import OpenAI

OUT = Path("public/games.json")

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["weekLabel", "games"],
    "properties": {
        "weekLabel": {"type": "string"},
        "games": {
            "type": "array",
            "minItems": 5,
            "maxItems": 20,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "away", "home", "date", "time", "venue",
                    "teamQuality", "recruitTalent", "matchupQuality",
                    "importance", "reason", "notableRecruits", "sources"
                ],
                "properties": {
                    "away": {"type": "string"},
                    "home": {"type": "string"},
                    "date": {"type": "string"},
                    "time": {"type": "string"},
                    "venue": {"type": "string"},
                    "teamQuality": {"type": "integer", "minimum": 0, "maximum": 100},
                    "recruitTalent": {"type": "integer", "minimum": 0, "maximum": 100},
                    "matchupQuality": {"type": "integer", "minimum": 0, "maximum": 100},
                    "importance": {"type": "integer", "minimum": 0, "maximum": 100},
                    "reason": {"type": "string"},
                    "notableRecruits": {
                        "type": "array",
                        "items": {"type": "string"},
                        "maxItems": 8
                    },
                    "sources": {
                        "type": "array",
                        "items": {"type": "string"},
                        "maxItems": 8
                    }
                }
            }
        }
    }
}

PROMPT = """
Research the NEXT Thursday-Saturday Dallas-Fort Worth high school football slate.

Return the best 10-20 REAL scheduled games in or involving the DFW area.

Geography includes Dallas, Fort Worth, Arlington, Mansfield, Duncanville,
DeSoto, Cedar Hill, Lancaster, Waxahachie, Midlothian, Aledo, Southlake,
Coppell, Lewisville, Denton, Prosper, Frisco, McKinney, Allen, Plano,
Rockwall, Forney, Mesquite and nearby DFW programs.

Research requirements:
1. Verify each opponent, date, kickoff time and venue with reliable current sources.
2. Research current rankings, records and recent performance.
3. Research notable college recruits on BOTH rosters.
4. Prioritize 5-star, 4-star, top-100 recruits, Power-4 commits and major Power-4 offers.
5. Do not invent games, players, commitments, times or venues.
6. If a fact is uncertain, omit it instead of guessing.
7. Put the source URLs used for each game in the sources array.

Return four component ratings from 0-100:
- Team Quality
- Recruit Talent
- Matchup Quality
- Importance

Scoring guidance:
- Team Quality: 100 means two national/state powers.
- Recruit Talent: heavily reward blue-chip and Power-4 talent across both rosters.
- Matchup Quality: reward games expected to be close; penalize likely blowouts.
- Importance: reward ranked-vs-ranked, district stakes, rivalries, playoffs and showcase games.

Do NOT calculate the final Game Score.
"""

def game_score(g):
    return round(
        g["teamQuality"] * 0.40
        + g["recruitTalent"] * 0.35
        + g["matchupQuality"] * 0.15
        + g["importance"] * 0.10
    )

def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY GitHub secret is missing.")

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model="gpt-5.4-mini",
        tools=[{"type": "web_search"}],
        input=PROMPT,
        text={
            "format": {
                "type": "json_schema",
                "name": "dfw_games",
                "strict": True,
                "schema": SCHEMA,
            }
        },
    )

    data = json.loads(response.output_text)
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    data["sourceMode"] = "live"
    data["games"] = sorted(
        [{**g, "gameScore": game_score(g)} for g in data["games"]],
        key=lambda g: g["gameScore"],
        reverse=True,
    )

    OUT.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Updated {OUT} with {len(data['games'])} games.")

if __name__ == "__main__":
    main()
