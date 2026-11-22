// Fetches the free reading content (notes, current affairs, answer frames, cases...) from the app server's public feed
// (GET https://app.aspiran.in/web/site-content, server/src/site-content.ts in the app repo) into src/data/site-content.json.
// Runs before every build (npm run build), and GitHub rebuilds the site every morning, so current affairs stay fresh.
// If the feed can't be reached, the last saved copy is kept and the build carries on with it.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';

const URL_ = process.env.CONTENT_URL ?? 'https://app.aspiran.in/web/site-content';
const OUT = new URL('../src/data/site-content.json', import.meta.url);
mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true });

try {
  const r = await fetch(URL_, { signal: AbortSignal.timeout(60_000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data.items) || !Array.isArray(data.briefs) || data.paused) throw new Error('the feed is paused or empty');
  writeFileSync(OUT, JSON.stringify(data));
  console.log(`content: ${data.items.length} items, ${data.briefs.length} days of current affairs (${data.generatedAt})`);
} catch (e) {
  if (!existsSync(OUT)) { console.error(`content: could not fetch ${URL_} (${e.message}) and there is no saved copy`); process.exit(1); }
  console.warn(`content: could not fetch ${URL_} (${e.message}); building with the saved copy`);
}
