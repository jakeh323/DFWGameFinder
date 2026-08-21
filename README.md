# DFW Game Finder — GitHub Actions Version

This version has NO Netlify Functions and NO refresh URL.

How it updates:
1. GitHub Actions runs Monday, Wednesday and Friday at 8:00 AM America/Chicago.
2. The action uses the OpenAI API with web search to research the upcoming DFW slate.
3. It overwrites `public/games.json`.
4. The action commits that file to `main`.
5. Netlify sees the GitHub commit and automatically publishes the new data.

Required GitHub secret:
- `OPENAI_API_KEY`

Set it in:
GitHub repo > Settings > Secrets and variables > Actions > New repository secret

You can also run an update manually:
GitHub repo > Actions > Update DFW Games > Run workflow

Netlify only needs to publish the `public` directory. No Netlify environment variables are required.
