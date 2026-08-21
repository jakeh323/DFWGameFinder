import fs from "node:fs";
import path from "node:path";
import { loadSaved, seedWithScores } from "./_shared.mjs";

export const handler = async () => {
  try {
    const saved = await loadSaved();
    if (saved) {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json", "cache-control":"no-store" },
        body: JSON.stringify(saved)
      };
    }
  } catch (e) {
    console.error("Blob load failed:", e);
  }

  const seed = JSON.parse(fs.readFileSync(path.join(process.cwd(),"seed.json"),"utf8"));
  return {
    statusCode: 200,
    headers: { "content-type": "application/json", "cache-control":"no-store" },
    body: JSON.stringify(seedWithScores(seed))
  };
};
