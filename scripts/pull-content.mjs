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

// The Binge shelf (/binge/): the app's free short videos, read from the same public feed the app uses
// (GET /ca?series=..., then /ca/<week>; server/src/ca.ts). Illustrated shorts come in English (2001-NN) and Hindi (2002-NN)
// and are paired by id; "Syllabus in a minute" is English only, and only its GS weeks are kept. Captions are fetched too, so
// each short's page has a readable transcript. Tragic tone is never shown. Videos stay on app.aspiran.in; only links are kept.
const API = process.env.SHORTS_API ?? 'https://app.aspiran.in';
const SHORTS = new URL('../src/data/shorts.json', import.meta.url);
const GS_MINUTE = new Set(['2000-01', '2000-02', '2000-03', '2000-04', '2000-05', '2000-11', '2000-12']);
const vttText = (v) => v.split(/\r?\n\r?\n/).map((b) => b.split(/\r?\n/).filter((l) => l && !/-->/.test(l) && !/^\d+$/.test(l) && l !== 'WEBVTT').join(' ')).filter(Boolean).join(' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const get = async (u, kind = 'json') => { const r = await fetch(u, { signal: AbortSignal.timeout(30_000) }); if (!r.ok) throw new Error(`HTTP ${r.status} for ${u}`); return kind === 'json' ? r.json() : r.text(); };
async function series(name) {
  const { weeks } = await get(`${API}/ca?series=${name}`);
  const out = [];
  // Weeks and captions are fetched side by side (about 300 small files), not one after another.
  const ms = await Promise.all(weeks.map((w) => get(`${API}/ca/${w.week}`).then((m) => ({ w, m }))));
  for (const { w, m } of ms) {
    const abs = (f) => (f ? `${API}${m.base}${f}` : null);
    const eps = m.episodes.filter((e) => !/tragic/i.test(e.tone ?? '') && e.free);
    const texts = await Promise.all(eps.map((e) => get(abs(e.vtt), 'text').then(vttText).catch(() => '')));
    eps.forEach((e, k) => {
      const transcript = texts[k];
      out.push({ week: w.week, lang: m.lang, id: e.id, n: e.n, title: e.title, dur: Math.round(e.durationSec), format: e.format ?? 'minute', tone: e.tone ?? 'NEUTRAL',
        nodes: e.syllabusNodes ?? [], mp4: abs(e.mp4), vtt: abs(e.vtt), poster: abs(e.poster), quiz: (e.quiz ?? []).slice(0, 2), transcript });
    });
  }
  return out;
}
try {
  const shorts = await series('illustrated-shorts');
  const byId = new Map();
  for (const s of shorts) { const x = byId.get(s.id) ?? { id: s.id, n: s.n, format: s.format, tone: s.tone, nodes: s.nodes }; x[s.lang] = s; byId.set(s.id, x); }
  const minute = (await series('syllabus-in-a-minute')).filter((s) => GS_MINUTE.has(s.week)).map((s) => ({ id: `minute-${s.week}-${s.n}`, n: s.n, format: 'minute', tone: s.tone, nodes: s.nodes, en: s }));
  const items = [...byId.values()].filter((x) => x.en).sort((a, b) => a.n - b.n);
  writeFileSync(SHORTS, JSON.stringify({ generatedAt: new Date().toISOString(), shorts: items, minute }));
  console.log(`shorts: ${items.length} illustrated (${items.filter((x) => x.hi).length} with Hindi), ${minute.length} one-minute`);
} catch (e) {
  if (!existsSync(SHORTS)) { writeFileSync(SHORTS, JSON.stringify({ shorts: [], minute: [] })); console.warn(`shorts: could not fetch (${e.message}); building with none`); }
  else console.warn(`shorts: could not fetch (${e.message}); building with the saved copy`);
}
