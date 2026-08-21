export default async () => {
  const siteUrl = process.env.URL;
  const secret = process.env.REFRESH_SECRET || "";

  if (!siteUrl) {
    throw new Error("Netlify URL environment variable is missing.");
  }

  const response = await fetch(`${siteUrl}/api/refresh?key=${encodeURIComponent(secret)}`);

  if (!response.ok) {
    throw new Error(`Refresh returned ${response.status}`);
  }

  console.log("DFW Game Finder scheduled refresh completed.");
};

export const config = {
  schedule: "0 14 * * 1,3,5"
};
