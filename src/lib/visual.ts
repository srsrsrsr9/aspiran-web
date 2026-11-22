// Pictures for the free pages, drawn from each page's own data at build time (owner, 22 Nov 2026: "get attention with
// beauty, gain intent with the muscle, and earn trust with the coverage and depth"). No image files: every cover is a
// small SVG built from a motif (picked from the words on the page) and a palette (picked from the page's id), so two
// pages side by side rarely look the same. Tragic pieces get a plain, quiet cover (content rules).
import { PAPERS, type Page, type Lang, tx, nodeName } from './content';

export const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

// Line art on a 48×48 box, stroke only. No flags, emblems or maps with borders.
export const ICONS: Record<string, string> = {
  coins: '<ellipse cx="24" cy="12" rx="13" ry="4.5"/><path d="M11 12v8c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5v-8"/><path d="M11 20v8c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5v-8"/><path d="M11 28v8c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5v-8"/>',
  bars: '<path d="M7 41h34"/><rect x="10" y="27" width="7" height="14" rx="1.5"/><rect x="20.5" y="18" width="7" height="23" rx="1.5"/><rect x="31" y="8" width="7" height="33" rx="1.5"/>',
  rise: '<path d="M6 38l11-11 7 6 16-18"/><path d="M31 15h9v9"/><path d="M6 42h36"/>',
  ship: '<path d="M5 31h38l-6 9H11z"/><rect x="11" y="21" width="9" height="10"/><rect x="20" y="21" width="9" height="10"/><rect x="15.5" y="12" width="9" height="9"/><path d="M33 31V16h4"/>',
  village: '<path d="M5 41h38"/><path d="M8 41V25l10-8 10 8v16"/><path d="M15 41v-8h6v8"/><path d="M28 41V30l7-6 7 6v11"/><path d="M33 41v-5h4v5"/>',
  leaf: '<path d="M9 39C9 20 21 9 40 8c0 19-11 31-31 31z"/><path d="M9 39L30 18"/><path d="M19 29h8M24 24v-7"/>',
  rocket: '<path d="M24 5c7 5 9 13 7 23H17c-2-10 0-18 7-23z"/><circle cx="24" cy="17" r="3"/><path d="M17 25l-6 6v6l7-4M31 25l6 6v6l-7-4M20.5 32l3.5 9 3.5-9"/>',
  pillars: '<path d="M6 16L24 7l18 9z"/><path d="M8 16h32M8 38h32M5 42h38"/><path d="M12 19v16M20 19v16M28 19v16M36 19v16"/>',
  ballot: '<rect x="8" y="23" width="32" height="18" rx="2"/><path d="M17 23l3-15 13 3-3 12"/><path d="M18 31h12"/>',
  wheat: '<path d="M24 43V11"/><path d="M24 16c-5-1-7-5-7-9 5 1 7 5 7 9zM24 16c5-1 7-5 7-9-5 1-7 5-7 9zM24 25c-5-1-7-5-7-9 5 1 7 5 7 9zM24 25c5-1 7-5 7-9-5 1-7 5-7 9zM24 34c-5-1-7-5-7-9 5 1 7 5 7 9zM24 34c5-1 7-5 7-9-5 1-7 5-7 9z"/>',
  sun: '<circle cx="24" cy="24" r="8"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4.2 4.2M33.3 33.3l4.2 4.2M37.5 10.5l-4.2 4.2M14.7 33.3l-4.2 4.2"/>',
  phone: '<rect x="14" y="5" width="20" height="38" rx="4"/><path d="M21 38h6"/><path d="M19 19l4 4 7-8"/>',
  shield: '<path d="M24 5l15 6v11c0 10-6 17-15 21C15 39 9 32 9 22V11z"/><path d="M18 24l5 5 8-9"/>',
  train: '<rect x="12" y="6" width="24" height="27" rx="5"/><path d="M12 20h24"/><circle cx="18" cy="27" r="1.6"/><circle cx="30" cy="27" r="1.6"/><path d="M16 33l-4 9M32 33l4 9M14 38h20"/>',
  people: '<circle cx="17" cy="15" r="5"/><circle cx="33" cy="17" r="4"/><path d="M6 41c0-9 5-15 11-15s11 6 11 15"/><path d="M27 31c1-4 3-6 6-6 5 0 9 5 9 14"/>',
  drop: '<path d="M24 5C17 15 11 23 11 29a13 13 0 0026 0c0-6-6-14-13-24z"/><path d="M17 30a7 7 0 007 7"/>',
  globe: '<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c-7 5-7 29 0 34M24 7c7 5 7 29 0 34"/><path d="M10 15h28M10 33h28"/>',
  arch: '<path d="M6 42h36M10 42V23M38 42V23M7 23h34"/><path d="M13 23l11-14 11 14"/><path d="M19 42v-9a5 5 0 0110 0v9"/><path d="M24 9V4"/>',
  scales: '<path d="M24 6v34M14 41h20M9 12h30"/><path d="M9 12L3 25h12zM39 12l-6 13h12z"/><path d="M3 25a6 3 0 0012 0M33 25a6 3 0 0012 0"/>',
  quill: '<path d="M41 6C26 8 14 20 11 37l4 1C20 25 30 15 41 6z"/><path d="M11 37l-3 6M19 27h9"/>',
  page: '<path d="M11 5h18l9 9v29H11z"/><path d="M29 5v9h9"/><path d="M16 21h16M16 27h16M16 33h10"/>',
  atom: '<circle cx="24" cy="24" r="3"/><ellipse cx="24" cy="24" rx="18" ry="7"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(120 24 24)"/>',
  mountain: '<path d="M3 41l14-23 8 12 6-8 14 19z"/><path d="M13 24l4 3 4-3"/><circle cx="37" cy="10" r="4"/>',
  letters: '<path d="M6 37l7-23 7 23M8.5 30h9"/><path d="M26 17h15M34 17v5c0 6-3 10-8 12M30 26c3 5 7 8 11 9"/>',
  health: '<path d="M19 7h10v12h12v10H29v12H19V29H7V19h12z"/>',
  gavel: '<path d="M14 13l9-9 13 13-9 9z"/><path d="M27 20L9 38"/><path d="M26 43h17"/>',
  chai: '<path d="M9 18h24v12a10 10 0 01-10 10h-4A10 10 0 019 30z"/><path d="M33 21h3a5 5 0 010 10h-4"/><path d="M15 6c-2 3 2 5 0 8M21 5c-2 3 2 5 0 8M27 6c-2 3 2 5 0 8"/><path d="M6 43h30"/>',
};
export type Motif = keyof typeof ICONS;

// Words → motif. Order matters: the more specific first.
const RULES: [RegExp, Motif][] = [
  [/isro|space|satellite|orbit|rocket|chandrayaan|gaganyaan|अंतरिक्ष/i, 'rocket'],
  [/election|vote|ballot|poll|चुनाव/i, 'ballot'],
  [/court|judg|bench|verdict|article \d|constitution|fundamental right|अदालत|संविधान/i, 'pillars'],
  [/parliament|bill|act\b|legislat|governor|federal|संसद/i, 'pillars'],
  [/panchayat|gram|village|rural|ग्राम|पंचायत/i, 'village'],
  [/farm|kisan|agri|crop|msp|food|wheat|rice|कृषि|किसान/i, 'wheat'],
  [/solar|energy|power|electric|coal|oil|gas|renewable|ऊर्जा|बिजली/i, 'sun'],
  [/upi|digital|payment|cyber|data|internet|fintech|डिजिटल/i, 'phone'],
  [/defen[cs]e|security|terror|army|navy|insurgen|naxal|border|सुरक्षा/i, 'shield'],
  [/rail|road|highway|port|airport|infrastructure|metro|transport/i, 'train'],
  [/export|import|trade|tariff|wto|fta|shipping|current account|व्यापार/i, 'ship'],
  [/inflation|price|cpi|wpi|rate|repo|yield|महँगाई|मुद्रास्फीति/i, 'rise'],
  [/gdp|growth|gva|survey|index|statistic|report|estimate|census|आय/i, 'bars'],
  [/rbi|bank|rupee|loan|credit|deposit|money|fund|fiscal|budget|tax|gst|bond|finance|बैंक|रुपया|कर/i, 'coins'],
  [/health|disease|vaccine|hospital|medic|nutrition|स्वास्थ्य/i, 'health'],
  [/forest|wildlife|climate|biodivers|tiger|wetland|pollution|environment|protected|पर्यावरण|जलवायु|वन/i, 'leaf'],
  [/water|river|monsoon|flood|rain|ocean|sea|glacier|जल|नदी|मानसून/i, 'drop'],
  [/women|child|tribal|caste|reservation|social|society|education|school|poverty|welfare|समाज|महिला/i, 'people'],
  [/foreign|bilateral|summit|g20|un\b|united nations|treaty|neighbour|international|diplomac|विदेश/i, 'globe'],
  [/science|technology|biotech|gene|quantum|nuclear|ai\b|semiconductor|विज्ञान/i, 'atom'],
  [/temple|art|culture|architecture|ancient|medieval|history|mauryan|gandhi|freedom|movement|इतिहास|कला/i, 'arch'],
  [/geograph|mountain|plate|earthquake|soil|climate zone|भूगोल/i, 'mountain'],
  [/ethic|integrity|dilemma|value|नैतिक/i, 'scales'],
  [/essay|निबंध/i, 'quill'],
];
const TOPIC: [RegExp, Motif][] = [
  [/econom|अर्थ/i, 'coins'], [/polity|governance|राज/i, 'pillars'], [/environment|पर्यावरण/i, 'leaf'], [/science|विज्ञान/i, 'atom'],
  [/international|ir\b/i, 'globe'], [/history|culture|ancient|medieval|art/i, 'arch'], [/geograph/i, 'mountain'],
  [/societ|social/i, 'people'], [/security/i, 'shield'], [/ethic/i, 'scales'], [/essay/i, 'quill'], [/csat/i, 'bars'],
];
/** A story's motif: its headline decides; the summary only when the headline says nothing. */
export const storyMotif = (c: any) => motifFor(String(c.headline ?? ''), '', motifFor(String(c.summary ?? ''), String(c.topic ?? '')));
export function motifFor(text: string, topic = '', fallback: Motif = 'chai'): Motif {
  for (const [re, m] of RULES) if (re.test(text)) return m;
  for (const [re, m] of TOPIC) if (re.test(topic)) return m;
  return fallback;
}

// Each palette: two background stops, the ink for the line art, and an accent. They carry their own colours, so they
// read the same in light and dark mode.
export const PALETTES = [
  { a: '#F8E3D3', b: '#EDC2A3', ink: '#8A3A1B', acc: '#F2B42C' }, // chai
  { a: '#FCEBB8', b: '#F2CB63', ink: '#6A4806', acc: '#B4502A' }, // haldi
  { a: '#DFF0E2', b: '#B2D9BE', ink: '#1E4F37', acc: '#F2B42C' }, // leaf
  { a: '#E1E6F6', b: '#B7C3EA', ink: '#2A3872', acc: '#E8875A' }, // indigo
  { a: '#F7DEE2', b: '#EBB3BD', ink: '#782536', acc: '#2E6A4C' }, // rose
  { a: '#D6EFEC', b: '#A3D8D1', ink: '#164F49', acc: '#B4502A' }, // teal
  { a: '#262A3D', b: '#3A4163', ink: '#F3ECE0', acc: '#E9B13A' }, // night
];
export const QUIET = { a: '#ECE8E2', b: '#D9D3CA', ink: '#5E574F', acc: '#B9B1A6' };
export const paletteFor = (seed: string, tone?: string) => (/tragic/i.test(tone ?? '') ? QUIET : PALETTES[hash(seed) % PALETTES.length]);

// The number worth remembering in a piece of text: a percentage first (drawn as a ring), then money, then any count
// with a unit. Returns the sentence it came from as the caption.
export interface BigNum { big: string; pct?: number; line: string }
export function bigNumber(lines: string[]): BigNum | null {
  const L = lines.filter(Boolean).map(String);
  for (const line of L) {
    const m = /(\d+(?:\.\d+)?)\s?(%|per ?cent|प्रतिशत)/i.exec(line);
    if (m) { const v = Number(m[1]); if (v > 0 && v <= 100) return { big: `${m[1]}%`, pct: v, line }; }
  }
  for (const line of L) {
    const m = /((?:₹|Rs\.?|INR|\$|US\$)\s?[\d,.]+(?:\s?(?:lakh crore|crore|lakh|billion|million|trillion|bn|करोड़|लाख))?)/i.exec(line);
    if (m) return { big: m[1].replace(/^Rs\.?\s?|^INR\s?/i, '₹').replace(/\s+/g, ' '), line };
  }
  for (const line of L) {
    const m = /(\d[\d,.]*\s?(?:lakh crore|crore|lakh|billion|million|tonnes|km|MW|GW|kg|litres|days|judges|households|villages|districts|करोड़|लाख|दिन))/i.exec(line);
    if (m) return { big: m[1], line };
  }
  return null;
}

// How often UPSC has asked on a page's syllabus: Mains PYQs on its exact syllabus line (gs…), Prelims PYQs on its
// Prelims subject (pre…, tagged more broadly). Counted per year, separately, so the chart can say which is which.
export const YEARS = [...new Set(PAPERS.map((p) => p.year))].sort((a, b) => a - b);
type Hit = { paper: (typeof PAPERS)[number]; q: (typeof PAPERS)[number]['questions'][number] };
export function pyqPulse(nodes: string[]) {
  const mainsNode = nodes.find((n) => !n.startsWith('pre-'));
  const preNode = nodes.find((n) => n.startsWith('pre-'));
  const mains = new Map<number, number>(YEARS.map((y) => [y, 0])), pre = new Map<number, number>(YEARS.map((y) => [y, 0]));
  const mHits: Hit[] = [], pHits: Hit[] = [];
  for (const paper of PAPERS) for (const q of paper.questions) {
    const ns = q.nodes ?? [];
    if (paper.exam === 'mains' && mainsNode && ns.includes(mainsNode)) { mains.set(paper.year, (mains.get(paper.year) ?? 0) + 1); mHits.push({ paper, q }); }
    else if (paper.exam === 'prelims' && preNode && ns.includes(preNode)) { pre.set(paper.year, (pre.get(paper.year) ?? 0) + 1); pHits.push({ paper, q }); }
  }
  return { mains, pre, mHits, pHits, mainsNode, preNode, total: mHits.length + pHits.length };
}

// The cover for a free page: motif from its words, a badge that says where it sits.
export function pageArt(p: Page, lang: Lang): { seed: string; motif: Motif; badge?: string; tone?: string } {
  const d = p.data, hi = lang === 'hi', seed = `${p.section}/${p.slug}`, tone = d.tone;
  const paperOf = (g: any) => (/^\d$/.test(String(g ?? '')) ? `GS${g}` : g ? String(g) : undefined);
  switch (p.kind) {
    case 'read': return { seed, tone, motif: motifFor(`${tx(d.title, 'en')} ${tx(d.dek, 'en')}`, d.topic, 'page'), badge: paperOf(d.gsPaper) ?? p.node?.paper };
    case 'mains-skeleton': return { seed, tone, motif: motifFor(d.asked?.en ?? tx(d.question, 'en'), '', 'page'), badge: d.asked ? `${hi ? 'मेन्स' : 'Mains'} ${d.asked.year} · ${String(d.asked.paper).toUpperCase()}` : undefined };
    case 'gs4-case': case 'ethics-dilemma': return { seed, tone, motif: hash(seed) % 2 ? 'scales' : motifFor(`${tx(d.tension, 'en')} ${tx(d.case, 'en')} ${d.en?.scenario ?? ''}`, '', 'scales'), badge: 'GS4' };
    case 'essay': return { seed, tone, motif: motifFor(tx(d.topic, 'en'), '', 'quill'), badge: hi ? 'एसे' : 'Essay' };
    case 'landmark-case': return { seed, tone, motif: hash(seed) % 3 ? 'gavel' : 'pillars', badge: String(d.year ?? '') };
    case 'scheme-snapshot': return { seed, tone, motif: motifFor(`${d.en?.name ?? ''} ${d.en?.aim ?? ''}`, '', 'coins'), badge: d.launched ? (hi ? `${d.launched} से` : `Since ${d.launched}`) : undefined };
    default: return { seed, tone, motif: 'letters', badge: hi ? 'इंग्लिश–हिंदी' : 'English–Hindi' };
  }
}

// ---- PYQ pictures (22 Nov 2026, v7b) -------------------------------------------------------------------------------
export const PAPER_MOTIF: Record<string, Motif> = { prelims: 'bars', csat: 'bars', gs1: 'arch', gs2: 'pillars', gs3: 'coins', gs4: 'scales', essay: 'quill' };
// Prelims subjects in Hindi (the syllabus lines themselves are only in English).
const PRE_HI: Record<string, string> = { 'pre-1': 'राष्ट्रीय और अंतरराष्ट्रीय करंट अफ़ेयर्स', 'pre-2': 'भारत का इतिहास और राष्ट्रीय आंदोलन', 'pre-3': 'भारत और विश्व का भूगोल',
  'pre-4': 'भारतीय राजव्यवस्था और शासन', 'pre-5': 'आर्थिक और सामाजिक विकास', 'pre-6': 'पर्यावरण, जैव विविधता और जलवायु परिवर्तन', 'pre-7': 'सामान्य विज्ञान' };
export const nodeLabel = (id: string, lang: Lang) => (lang === 'hi' && PRE_HI[id]) || NODE_NAMES.get(id) || id;
const NODE_NAMES = new Map<string, string>();
export const nodeHref = (id: string) => { const n = nodeName(id); return n ? `https://app.aspiran.in${n.learn}` : undefined; };
for (const p of PAPERS) for (const q of p.questions) for (const id of q.nodes ?? []) if (!NODE_NAMES.has(id)) { const n = nodeName(id); if (n) NODE_NAMES.set(id, n.name); }

/** Which syllabus lines one paper asked on, most first. */
export function paperMix(paper: (typeof PAPERS)[number]) {
  const m = new Map<string, number>();
  for (const q of paper.questions) for (const id of q.nodes ?? []) m.set(id, (m.get(id) ?? 0) + 1);
  return [...m.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count);
}
/** Across all papers of one exam: the syllabus lines UPSC has asked on most. */
export function mostAsked(exam: 'prelims' | 'mains', n = 8) {
  const m = new Map<string, number>();
  for (const p of PAPERS) if (p.exam === exam) for (const q of p.questions) for (const id of q.nodes ?? []) if (id !== 'essay-1') m.set(id, (m.get(id) ?? 0) + 1);
  return [...m.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count).slice(0, n);
}
