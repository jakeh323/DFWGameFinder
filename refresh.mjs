import { researchGames, saveSaved } from "./_shared.mjs";

export const handler = async (event) => {
  const expected = process.env.REFRESH_SECRET || "";
  const supplied = event.queryStringParameters?.key || event.headers["x-refresh-secret"] || "";

  if (expected && supplied !== expected) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  try {
    const data = await researchGames();
    await saveSaved(data);
    return {
      statusCode: 200,
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ ok:true, weekLabel:data.weekLabel, games:data.games.length, updatedAt:data.updatedAt })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: `Refresh failed: ${e.message}` };
  }
};
