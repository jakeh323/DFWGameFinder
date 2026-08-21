export default async () => {
  const siteUrl = process.env.URL;
  const secret = process.env.REFRESH_SECRET || "";
  if (!siteUrl) throw new Error("Netlify URL environment variable is missing.");

  const response = await fetch(`${siteUrl}/api/refresh`, {
    headers: { "x-refresh-secret": secret }
  });

  if (!response.ok && response.status !== 202) {
    throw new Error(`Background refresh trigger returned ${response.status}`);
  }

  console.log("Triggered DFW Game Finder background refresh.");
};

export const config = {
  schedule: "0 14 * * 1,3,5"
};
