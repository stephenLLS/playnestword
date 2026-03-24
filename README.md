# NestWord — Daily Word Casino
> Built by All Spark Enterprises Ltd.
> Hosted at: playnestword.com

## Files
- `index.html` — Full game (themed, all logic included)
- `words.js`   — Word bank, 8 themes, auto-rotation
- `dictionary.js` — 3000+ word validator + bonus scoring engine
- `vercel.json` — Vercel hosting config

## Deploy to Vercel (5 min)
1. Push this folder to a GitHub repo named `nestword`
2. Go to vercel.com → New Project → Import from GitHub
3. Select the `nestword` repo → Deploy (no settings needed)
4. Add domain: play.allsparkenterprisesltd.ca in Vercel → Settings → Domains

## When playnestword.com is ready
1. Register at namecheap.com
2. Add to Vercel → Settings → Domains
3. Point DNS: CNAME `@` → `cname.vercel-dns.com`

## AdSense (after approval)
Find this line in index.html:
  <!-- <ins class="adsbygoogle" ...
Replace with your actual AdSense code from adsense.google.com

## Adding Words
Open words.js → add to any theme array
Rules: 10+ letters, no spaces, real English words

## Adding Themes
In words.js:
1. Add array to WORD_BANK
2. Add entry to THEMES object
3. Add key to THEME_ORDER array
