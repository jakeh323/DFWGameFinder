DFW GAME FINDER — FUNCTIONS FIXED

Direct function endpoints:
- /.netlify/functions/games
- /.netlify/functions/refresh?key=YOUR_REFRESH_SECRET

Upload all contents to the root of the GitHub repo and commit.
Netlify should redeploy automatically.

After deploy:
1. Test /.netlify/functions/games
2. Add/confirm OPENAI_API_KEY and REFRESH_SECRET in Netlify
3. Test /.netlify/functions/refresh?key=YOUR_REFRESH_SECRET
