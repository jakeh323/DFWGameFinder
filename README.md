DFW GAME FINDER — DYNAMIC NETLIFY VERSION

WHAT THIS DOES
- Public website hosted by Netlify.
- /api/games reads the latest saved leaderboard from Netlify Blobs.
- /api/refresh runs an OpenAI web-search research job in the background.
- refresh-scheduled triggers that job Monday, Wednesday and Friday.
- The page computes and displays the 40/35/15/10 ranking.

FIRST DEPLOY
1. Put every file/folder from this project into the ROOT of your GitHub repository DFWGameFinder.
2. Commit the files to the main branch.
3. Netlify will detect the GitHub commit and redeploy automatically.
4. In Netlify open:
   Project configuration > Environment variables
5. Add:
   OPENAI_API_KEY = your OpenAI API key
   REFRESH_SECRET = make up a long random private phrase
6. Redeploy after adding the environment variables.

FIRST LIVE REFRESH
After the redeploy, trigger one research run in your browser:
https://YOUR-NETLIFY-SITE.netlify.app/api/refresh?key=YOUR_REFRESH_SECRET

The response will normally be an immediate 202 because the research runs as a background function.
Then reload the homepage. It will use seed data until the first live research result is saved.

AUTOMATIC SCHEDULE
The project runs the refresh trigger at:
0 14 * * 1,3,5
That means 14:00 UTC every Monday, Wednesday and Friday.
Netlify scheduled functions use UTC.

IMPORTANT
- Your ChatGPT subscription and OpenAI API billing are separate.
- Do not commit OPENAI_API_KEY or REFRESH_SECRET into GitHub.
- Netlify Blobs persists the researched JSON across deploys.
