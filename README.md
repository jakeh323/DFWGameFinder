DFW GAME FINDER — FIXED NETLIFY PROJECT

EXPECTED ROOT STRUCTURE

DFWGameFinder/
├── public/
│   └── index.html
├── netlify/
│   └── functions/
│       ├── _shared.mjs
│       ├── games.mjs
│       ├── refresh-background.mjs
│       └── refresh-scheduled.mjs
├── netlify.toml
├── package.json
├── seed.json
└── README.md

UPLOAD INSTRUCTIONS
1. Unzip this file.
2. In GitHub, remove the incorrect prior files/folders if needed.
3. Upload the CONTENTS of this folder to the root of DFWGameFinder.
4. Commit to main.
5. Netlify should automatically redeploy.

NETLIFY ENVIRONMENT VARIABLES — ADD AFTER SUCCESSFUL DEPLOY
OPENAI_API_KEY
REFRESH_SECRET

Do not commit those secret values to GitHub.
