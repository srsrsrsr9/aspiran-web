// The Binge shelf (owner, 22 Nov 2026: "use people's inclination to get entertained, and show them shorts of popular
// topics"). Data: src/data/shorts.json, pulled from the app's public video feed by scripts/pull-content.mjs. The videos
// themselves stay on app.aspiran.in. Rules: sound off until the viewer turns it on, nothing plays by itself, captions on.
import raw from '../data/shorts.json';
import type { Lang } from './content';

export interface QuizQ { q: string; options: string[]; answerIndex: number; why: string }
export interface Cut { title: string; dur: number; mp4: string; vtt: string; poster: string; quiz: QuizQ[]; transcript: string }
export interface Short { id: string; n: number; format: string; tone: string; nodes: string[]; en: Cut; hi?: Cut }

const data = raw as unknown as { generatedAt?: string; shorts: Short[]; minute: Short[] };
export const SHORTS: Short[] = data.shorts ?? [];
export const MINUTE: Short[] = data.minute ?? [];
export const shortsAt = data.generatedAt ?? new Date().toISOString();

/** A short in a language: Hindi pages use the Hindi cut where there is one. */
export const cut = (s: Short, lang: Lang): Cut => (lang === 'hi' && s.hi) || s.en;
export const shortsIn = (lang: Lang) => (lang === 'hi' ? SHORTS.filter((s) => s.hi) : SHORTS);
export const shortUrl = (s: Short, lang: Lang) => `${lang === 'hi' ? '/hi' : ''}/binge/${s.id}/`;
export const bingeHome = (lang: Lang) => `${lang === 'hi' ? '/hi' : ''}/binge/`;
export const mins = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
export const isoDur = (sec: number) => `PT${Math.floor(sec / 60)}M${Math.round(sec % 60)}S`;

/** The shelves on /binge/, by how a short tells its story. */
export const SHELVES: { id: string; formats: string[]; en: [string, string]; hi: [string, string] }[] = [
  { id: 'stories', formats: ['story', 'diary'], en: ['Stories', 'Real people, real moments, in two minutes'], hi: ['कहानियाँ', 'असली लोग, असली पल, दो मिनट में'] },
  { id: 'lives', formats: ['biography'], en: ['Lives and objects', 'A seal, a pillar, a reformer: told in the first person'], hi: ['जीवन और चीज़ें', 'मुहर, स्तंभ, सुधारक: अपनी ज़ुबानी'] },
  { id: 'two-sides', formats: ['two-sides', 'myth-vs-fact'], en: ['Both sides, and myth or fact', 'The debates UPSC loves, argued both ways'], hi: ['दोनों पक्ष, और मिथक या सच', 'वो बहसें जो UPSC को पसंद हैं, दोनों तरफ़ से'] },
  { id: 'cases', formats: ['case-file'], en: ['Case files', 'You are the officer. What would you do?'], hi: ['केस फ़ाइलें', 'आप अफ़सर हैं। आप क्या करेंगे?'] },
  { id: 'journeys', formats: ['map-journey', 'timeline'], en: ['Maps and timelines', 'Follow a river, a march, a century'], hi: ['नक़्शे और टाइमलाइन', 'एक नदी, एक यात्रा, एक सदी के साथ चलिए'] },
  { id: 'ideas', formats: ['idea-cards', 'top-list'], en: ['Big ideas in six cards', 'A whole topic, card by card'], hi: ['छह कार्ड में बड़ी बात', 'पूरा टॉपिक, कार्ड दर कार्ड'] },
  { id: 'quiz', formats: ['countdown-quiz', 'past-question'], en: ['Beat the clock', 'Quick quizzes on what Prelims keeps asking'], hi: ['घड़ी से आगे', 'प्रीलिम्स जो बार-बार पूछता है, उस पर झटपट क्विज़'] },
];

/** Good first watches: strong hooks, a spread of papers. Not a view count (we don't show those). */
const STARTERS = ['the-emperor-who-regretted-a-war', 'the-pillar-that-hasnt-rusted', 'gold-on-a-plane', 'the-secret-radio-of-1942', 'monkey-king-bridge',
  'twenty-four-days-to-dandi', 'two-sides-a-uniform-civil-code', 'chicago-1893', 'case-file-the-gift-basket', 'the-village-that-voted-by-pot',
  'over-550-states-one-union', 'i-am-a-harappan-seal'];
export function starters(lang: Lang): Short[] {
  const pool = shortsIn(lang);
  const picked = STARTERS.map((id) => pool.find((s) => s.id === id)).filter(Boolean) as Short[];
  return picked.length >= 6 ? picked : pool.slice(0, 12);
}

/** Shorts on the same syllabus lines, best overlap first (for "Watch on this topic" and "Watch next"). */
export function shortsFor(nodes: string[], lang: Lang, n = 3, skip?: string): Short[] {
  const want = new Set(nodes.filter(Boolean));
  if (!want.size) return [];
  return shortsIn(lang)
    .filter((s) => s.id !== skip)
    .map((s) => ({ s, k: s.nodes.filter((x) => want.has(x)).length }))
    .filter((x) => x.k > 0)
    .sort((a, b) => b.k - a.k || a.s.n - b.s.n)
    .slice(0, n)
    .map((x) => x.s);
}

/** What the feed player needs, small enough to inline on the page. */
export const feedItem = (s: Short, lang: Lang) => {
  const c = cut(s, lang);
  return { id: s.id, t: c.title, d: c.dur, v: c.mp4, c: c.vtt, p: c.poster, u: shortUrl(s, lang), q: c.quiz[0] ?? null };
};
