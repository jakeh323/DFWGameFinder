import { schedule } from "@netlify/functions";

const run = async () => {
  const site = process.env.URL;
  const secret = process.env.REFRESH_SECRET || "";
  if (!site) throw new Error("Netlify URL is unavailable.");

  const r = await fetch(`${site}/.netlify/functions/refresh?key=${encodeURIComponent(secret)}`);
  if (!r.ok) throw new Error(`Refresh returned ${r.status}: ${await r.text()}`);
};

export const handler = schedule("0 14 * * 1,3,5", run);
