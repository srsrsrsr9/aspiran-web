// The free reading pages: everything comes from src/data/site-content.json (scripts/pull-content.mjs), built into static
// pages at build time. Seven sections, each in English and, where the item's Hindi is approved, in Hindi under /hi/.
import raw from '../data/site-content.json';

export type Lang = 'en' | 'hi';
type Item = { id: string; kind: string; updatedAt: string; hindi: boolean; data: any };
type Card = Record<string, any>;
type Day = { day: string; items: Card[] };
type Node = { id: string; name: string; paper: string; learn: string };

const DATA = raw as unknown as { generatedAt: string; nodes?: Node[]; items: Item[]; briefs: Day[] };
export const APP = 'https://app.aspiran.in';
export const generatedAt = DATA.generatedAt;
const NODES = new Map((DATA.nodes ?? []).map((n) => [n.id, n]));

/** A text field in either { en, hi } or plain-string form. */
export const tx = (v: any, lang: Lang): string => (typeof v === 'string' ? v : (v?.[lang] ?? (lang === 'hi' ? '' : v?.en) ?? ''));
export const has = (v: any, lang: Lang) => Boolean(tx(v, lang).trim());
export const paras = (s: string) => String(s ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
export const clip = (s: string, n: number) => { const x = String(s ?? '').replace(/\s+/g, ' ').trim(); if (x.length <= n) return x; const c = x.lastIndexOf(' ', n - 1); return x.slice(0, c > n * 0.6 ? c : n - 1) + '…'; };
const prefix = (lang: Lang) => (lang === 'hi' ? '/hi' : '');

// --- Sections ----------------------------------------------------------------------------------------------------

export type SectionId = 'notes' | 'mains-answer-writing' | 'ethics-case-studies' | 'essay-topics' | 'landmark-judgments' | 'government-schemes' | 'glossary';
export interface Section { id: SectionId; kinds: string[]; name: Record<Lang, string>; title: Record<Lang, string>; blurb: Record<Lang, string>; one: Record<Lang, string> }

export const SECTIONS: Section[] = [
  { id: 'notes', kinds: ['read'],
    name: { en: 'Notes', hi: 'नोट्स' },
    title: { en: 'Free UPSC notes, topic by topic', hi: 'UPSC के मुफ़्त नोट्स, टॉपिक दर टॉपिक' },
    blurb: { en: 'Clear, exam-focused notes for Prelims and Mains, mapped to the syllabus. Each ends with questions to test yourself.', hi: 'प्रीलिम्स और मेन्स के लिए साफ़, परीक्षा पर केंद्रित नोट्स, सिलेबस के हिसाब से। हर नोट के अंत में ख़ुद को परखने के सवाल।' },
    one: { en: 'note', hi: 'नोट' } },
  { id: 'mains-answer-writing', kinds: ['mains-skeleton'],
    name: { en: 'Mains answer frames', hi: 'मेन्स उत्तर ढाँचे' },
    title: { en: 'UPSC Mains answer writing: how to frame real past questions', hi: 'UPSC मेन्स उत्तर लेखन: असली पिछले सवालों का ढाँचा' },
    blurb: { en: 'Actual UPSC Mains questions, each with what the directive word wants, an intro, the points to cover, a conclusion and the mistake most people make.', hi: 'UPSC मेन्स के असली सवाल, हर एक के साथ: निर्देश शब्द क्या माँगता है, भूमिका, कवर करने के बिंदु, निष्कर्ष और सबसे आम ग़लती।' },
    one: { en: 'answer frame', hi: 'उत्तर ढाँचा' } },
  { id: 'ethics-case-studies', kinds: ['gs4-case', 'ethics-dilemma'],
    name: { en: 'Ethics case studies', hi: 'एथिक्स केस स्टडी' },
    title: { en: 'GS4 ethics case studies with worked solutions', hi: 'GS4 एथिक्स केस स्टडी, हल के साथ' },
    blurb: { en: 'Practice cases in the UPSC GS Paper IV style: the stakeholders, the options, what each one costs, and a reasoned choice.', hi: 'UPSC GS पेपर IV की शैली में अभ्यास केस: हितधारक, विकल्प, हर विकल्प की क़ीमत, और एक तर्कपूर्ण चुनाव।' },
    one: { en: 'case', hi: 'केस' } },
  { id: 'essay-topics', kinds: ['essay'],
    name: { en: 'Essay topics', hi: 'निबंध विषय' },
    title: { en: 'UPSC essay topics with outlines and openers', hi: 'UPSC निबंध विषय, रूपरेखा और शुरुआत के साथ' },
    blurb: { en: 'Essay topics in the UPSC style, each with a stand, an outline, angles to cover, ways to open and the traps to avoid.', hi: 'UPSC शैली के निबंध विषय, हर एक के साथ: पक्ष, रूपरेखा, आयाम, शुरुआत के तरीक़े और बचने लायक़ ग़लतियाँ।' },
    one: { en: 'essay topic', hi: 'निबंध विषय' } },
  { id: 'landmark-judgments', kinds: ['landmark-case'],
    name: { en: 'Landmark judgments', hi: 'ऐतिहासिक फ़ैसले' },
    title: { en: 'Landmark Supreme Court judgments for UPSC', hi: 'UPSC के लिए सुप्रीम कोर्ट के ऐतिहासिक फ़ैसले' },
    blurb: { en: 'The cases that come up again and again in Polity: the question before the court, what it held, and why it matters for the exam.', hi: 'राजव्यवस्था में बार-बार आने वाले केस: अदालत के सामने सवाल, फ़ैसला, और परीक्षा के लिए उसका महत्व।' },
    one: { en: 'judgment', hi: 'फ़ैसला' } },
  { id: 'government-schemes', kinds: ['scheme-snapshot'],
    name: { en: 'Government schemes', hi: 'सरकारी योजनाएँ' },
    title: { en: 'Government schemes for UPSC, one page each', hi: 'UPSC के लिए सरकारी योजनाएँ, हर एक एक पेज में' },
    blurb: { en: 'Each scheme on one page: ministry, aim, who it covers, the number to remember and the exam angle.', hi: 'हर योजना एक पेज में: मंत्रालय, उद्देश्य, किसे मिलती है, याद रखने लायक़ आँकड़ा और परीक्षा का नज़रिया।' },
    one: { en: 'scheme', hi: 'योजना' } },
  { id: 'glossary', kinds: ['terms'],
    name: { en: 'English–Hindi glossary', hi: 'अंग्रेज़ी–हिंदी शब्दावली' },
    title: { en: 'English–Hindi UPSC glossary, subject by subject', hi: 'UPSC अंग्रेज़ी–हिंदी शब्दावली, विषय दर विषय' },
    blurb: { en: 'The terms you meet in every subject, in English and Hindi, with a one-line meaning. Made for Hindi-medium aspirants reading English sources, and the other way round.', hi: 'हर विषय के ज़रूरी शब्द, अंग्रेज़ी और हिंदी में, एक पंक्ति के अर्थ के साथ। अंग्रेज़ी स्रोत पढ़ने वाले हिंदी माध्यम के अभ्यर्थियों के लिए, और उल्टा भी।' },
    one: { en: 'list', hi: 'सूची' } },
];
export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);

// --- Items as pages ----------------------------------------------------------------------------------------------

export interface Page { section: SectionId; kind: string; slug: string; data: any; hindi: boolean; title: Record<Lang, string>; desc: Record<Lang, string>; group: Record<Lang, string>; updatedAt: string; node?: Node }

const PAPER_OF_PREFIX: Record<string, string> = { eco: 'GS3', env: 'GS3', sci: 'GS3', pol: 'GS2', ir: 'GS2', his: 'GS1', anc: 'GS1', art: 'GS1', geo: 'GS1', soc: 'GS1', eth: 'GS4' };
const PAPER_LABEL: Record<string, Record<Lang, string>> = {
  Prelims: { en: 'Prelims', hi: 'प्रीलिम्स' }, CSAT: { en: 'CSAT', hi: 'CSAT' }, GS1: { en: 'GS1: History, Geography, Society', hi: 'GS1: इतिहास, भूगोल, समाज' },
  GS2: { en: 'GS2: Polity, Governance, IR', hi: 'GS2: राजव्यवस्था, शासन, अंतरराष्ट्रीय संबंध' }, GS3: { en: 'GS3: Economy, Environment, Science, Security', hi: 'GS3: अर्थव्यवस्था, पर्यावरण, विज्ञान, सुरक्षा' },
  GS4: { en: 'GS4: Ethics', hi: 'GS4: नीतिशास्त्र' }, Essay: { en: 'Essay', hi: 'निबंध' }, Other: { en: 'More', hi: 'और' },
};
export const PAPER_ORDER = ['Prelims', 'GS1', 'GS2', 'GS3', 'GS4', 'Essay', 'CSAT', 'Other'];
const paperOf = (d: any): string => {
  const n = NODES.get(d.node) ?? (d.nodes ?? []).map((x: string) => NODES.get(x)).find(Boolean);
  if (n) return n.paper;
  if (d.gsPaper) return String(d.gsPaper);
  return PAPER_OF_PREFIX[String(d.node ?? '').split('-')[0]] ?? 'Other';
};
const both = (en: string, hi: string) => ({ en, hi: hi || en });
const SETTINGS: Record<string, Record<Lang, string>> = { district: { en: 'District administration', hi: 'ज़िला प्रशासन' }, police: { en: 'Police', hi: 'पुलिस' }, corporate: { en: 'Workplace', hi: 'कार्यस्थल' }, personal: { en: 'Personal', hi: 'व्यक्तिगत' } };

function toPage(it: Item): Page | null {
  const d = it.data, sec = SECTIONS.find((s) => s.kinds.includes(it.kind));
  if (!sec || !d) return null;
  const hiOk = it.hindi;
  let title = both('', ''), desc = both('', ''), group = both('', ''), slug = '';
  switch (it.kind) {
    case 'read': {
      if (!d.sections?.en?.length) return null;
      title = both(tx(d.title, 'en'), tx(d.title, 'hi'));
      desc = both(clip(tx(d.dek, 'en') || d.sections.en[0].body, 155), clip(tx(d.dek, 'hi'), 155));
      const p = paperOf(d); group = { ...PAPER_LABEL[p] ?? PAPER_LABEL.Other };
      slug = slugify(tx(d.title, 'en'));
      break;
    }
    case 'mains-skeleton': {
      const q = d.asked?.en ?? tx(d.question, 'en');
      if (!q) return null;
      const m = /^csm-(\d{4})-(gs\d|essay)-q(\d+)$/.exec(d.pyqId ?? '');
      const where = m ? `Mains ${m[1]} ${m[2].toUpperCase()} Q${Number(m[3])}` : 'Mains';
      const whereHi = m ? `मेन्स ${m[1]} ${m[2].toUpperCase()} प्रश्न ${Number(m[3])}` : 'मेन्स';
      title = both(`${where}: ${clip(q, 70)}`, d.asked?.hi ? `${whereHi}: ${clip(d.asked.hi, 70)}` : '');
      desc = both(clip(`How to answer UPSC ${where}: ${q}`, 155), d.asked?.hi ? clip(`UPSC ${whereHi} का उत्तर कैसे लिखें: ${d.asked.hi}`, 155) : '');
      group = m ? both(m[2].toUpperCase(), m[2].toUpperCase()) : both('Mains', 'मेन्स');
      slug = m ? `${m[1]}-${m[2]}-q${Number(m[3])}-${slugify(q).slice(0, 50)}` : slugify(q);
      break;
    }
    case 'gs4-case': {
      title = both(tx(d.tension, 'en'), tx(d.tension, 'hi'));
      desc = both(clip(tx(d.case, 'en'), 155), clip(tx(d.case, 'hi'), 155));
      group = SETTINGS[d.setting] ? { ...SETTINGS[d.setting] } : both('Case studies', 'केस स्टडी');
      slug = slugify(tx(d.tension, 'en'));
      break;
    }
    case 'ethics-dilemma': {
      title = both(tx(d.title, 'en'), tx(d.title, 'hi'));
      desc = both(clip(d.en?.scenario ?? '', 155), clip(d.hi?.scenario ?? '', 155));
      group = both('Dilemmas', 'दुविधाएँ');
      slug = slugify(tx(d.title, 'en'));
      break;
    }
    case 'essay': {
      title = both(tx(d.topic, 'en'), tx(d.topic, 'hi'));
      desc = both(clip(`UPSC essay: "${tx(d.topic, 'en')}" ${tx(d.snap1Skeleton, 'en')}`, 155), clip(`UPSC निबंध: "${tx(d.topic, 'hi')}" ${tx(d.snap1Skeleton, 'hi')}`, 155));
      group = d.kind === 'abstract' ? both('Philosophical', 'दार्शनिक') : both('Issue-based', 'मुद्दा-आधारित');
      slug = slugify(tx(d.topic, 'en'));
      break;
    }
    case 'landmark-case': {
      title = both(`${tx(d.case, 'en')} (${d.year})`, tx(d.case, 'hi') ? `${tx(d.case, 'hi')} (${d.year})` : '');
      desc = both(clip(`${d.en?.held ?? ''} ${d.en?.matters ?? ''}`, 155), clip(`${d.hi?.held ?? ''} ${d.hi?.matters ?? ''}`, 155));
      group = both(d.year < 1980 ? 'Before 1980' : d.year < 2000 ? '1980 to 1999' : 'Since 2000', d.year < 1980 ? '1980 से पहले' : d.year < 2000 ? '1980 से 1999' : '2000 के बाद');
      slug = slugify(tx(d.case, 'en'));
      break;
    }
    case 'scheme-snapshot': {
      title = both(d.en?.name ?? tx(d.title, 'en'), d.hi?.name ?? '');
      desc = both(clip(`${d.en?.aim ?? ''} ${d.en?.examAngle ?? ''}`, 155), clip(`${d.hi?.aim ?? ''}`, 155));
      group = both(d.en?.ministry?.split(',')[0] ?? 'Schemes', d.hi?.ministry?.split(',')[0] ?? 'योजनाएँ');
      slug = slugify(tx(d.title, 'en') || d.en?.name || d.id);
      break;
    }
    case 'terms': {
      const subj = String(d.subject ?? d.id).replace(/-/g, ' ');
      const S = subj.charAt(0).toUpperCase() + subj.slice(1);
      title = both(`${S}: English–Hindi terms for UPSC`, `${S}: UPSC के लिए अंग्रेज़ी–हिंदी शब्द`);
      desc = both(clip(`${d.terms?.length ?? 0} ${subj} terms in English and Hindi with one-line meanings: ${(d.terms ?? []).slice(0, 6).map((t: any) => `${t.en} (${t.hi})`).join(', ')}.`, 155),
        clip(`${d.terms?.length ?? 0} शब्द, अंग्रेज़ी और हिंदी में, अर्थ के साथ: ${(d.terms ?? []).slice(0, 6).map((t: any) => `${t.hi} (${t.en})`).join(', ')}।`, 155));
      group = both('Subjects', 'विषय');
      slug = slugify(subj);
      break;
    }
  }
  if (!slug || !title.en) return null;
  const node = NODES.get(d.node) ?? (d.nodes ?? []).map((x: string) => NODES.get(x)).find(Boolean);
  // Hindi only where approved and the title itself is in Hindi.
  const hindi = hiOk && /[ऀ-ॿ]/.test(title.hi);
  return { section: sec.id, kind: it.kind, slug, data: d, hindi, title, desc, group, updatedAt: it.updatedAt, node };
}

const PAGES: Page[] = (() => {
  const out: Page[] = [];
  const seen = new Set<string>();
  for (const it of DATA.items) {
    const p = toPage(it);
    if (!p) continue;
    let s = p.slug, n = 2;
    while (seen.has(`${p.section}/${s}`)) s = `${p.slug}-${n++}`;
    p.slug = s; seen.add(`${p.section}/${s}`);
    out.push(p);
  }
  return out;
})();

export const pagesIn = (section: SectionId, lang: Lang = 'en') => PAGES.filter((p) => p.section === section && (lang === 'en' || p.hindi));
export const allPages = (lang: Lang = 'en') => PAGES.filter((p) => lang === 'en' || p.hindi);
export const pageUrl = (p: Page, lang: Lang) => `${prefix(lang)}/${p.section}/${p.slug}/`;
export const sectionUrl = (id: SectionId | 'current-affairs', lang: Lang) => `${prefix(lang)}/${id}/`;
export const count = (id: SectionId, lang: Lang = 'en') => pagesIn(id, lang).length;

/** Groups pages under their group label, in a sensible order. */
export function grouped(pages: Page[], lang: Lang): [string, Page[]][] {
  const m = new Map<string, Page[]>();
  for (const p of pages) { const g = p.group[lang]; m.set(g, [...(m.get(g) ?? []), p]); }
  const rank = (g: string) => { const i = PAPER_ORDER.findIndex((k) => PAPER_LABEL[k]?.[lang] === g); return i < 0 ? 50 : i; };
  return [...m.entries()].map(([g, ps]) => [g, ps.sort((a, b) => a.title[lang].localeCompare(b.title[lang]))] as [string, Page[]]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]));
}

/** Other pages from the same section and group, for "read next". */
export function related(p: Page, lang: Lang, n = 4): Page[] {
  const same = pagesIn(p.section, lang).filter((x) => x !== p);
  const g = same.filter((x) => x.group.en === p.group.en);
  return [...g, ...same.filter((x) => x.group.en !== p.group.en)].slice(0, n);
}

// --- Current affairs ---------------------------------------------------------------------------------------------

/** Automatic Hindi can come out garbled (20 Nov 2026): a two-word phrase repeated four or more times means skip it. */
function hindiLooksRight(c: Card): boolean {
  const h = c.hi;
  if (!h?.headline || !h?.summary || !/[ऀ-ॿ]/.test(h.headline)) return false;
  const words = [h.summary, ...(h.keyFacts ?? []), ...(h.whyForUpsc ?? [])].join(' ').split(/\s+/).filter(Boolean);
  const seen = new Map<string, number>();
  for (let i = 0; i + 1 < words.length; i++) { const k = words[i] + ' ' + words[i + 1]; seen.set(k, (seen.get(k) ?? 0) + 1); if (seen.get(k)! >= 4) return false; }
  return true;
}
export interface CaDay { day: string; cards: Card[]; hindi: boolean }
/** Routine notices (bond auctions, liquidity operations) are thin reading for an aspirant: the website leaves them out. */
const ROUTINE = /auction|dated securit|securities worth|VRRR|reverse repo|treasury bill|state development loan|money market operations|weekly statistical|statement of position|underwriting/i;
export const DAYS: CaDay[] = DATA.briefs
  .map((b) => ({ day: b.day, cards: b.items.filter((c) => c.headline && c.summary && !ROUTINE.test(c.headline)).map((c) => ({ ...c, hiOk: hindiLooksRight(c) })) }))
  .filter((b) => b.cards.length)
  .map((b) => ({ ...b, hindi: b.cards.some((c) => c.hiOk) }))
  .sort((a, b) => b.day.localeCompare(a.day));
export const caDays = (lang: Lang) => DAYS.filter((d) => lang === 'en' || d.hindi);
export const dayUrl = (day: string, lang: Lang) => `${prefix(lang)}/current-affairs/${day}/`;
const MONTHS = { en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'] };
export const longDate = (day: string, lang: Lang) => { const [y, m, d] = day.split('-').map(Number); return `${d} ${MONTHS[lang][m - 1]} ${y}`; };
export const monthOf = (day: string, lang: Lang) => { const [y, m] = day.split('-').map(Number); return `${MONTHS[lang][m - 1]} ${y}`; };
/** A card in one language: Hindi falls back to nothing (the page shows the English card only when Hindi is not right). */
export function cardIn(c: Card, lang: Lang) {
  if (lang === 'hi' && c.hiOk) {
    const h = c.hi;
    return { headline: h.headline, summary: h.summary, why: h.whyForUpsc ?? [], facts: h.keyFacts ?? [], mcq: h.mcq ?? null, mains: h.mainsPrompt ?? null, glossary: h.glossary ?? [] };
  }
  const e = c.examCorner ?? {};
  return { headline: c.headline, summary: c.summary, why: c.whyForUpsc ?? [], facts: e.keyFacts ?? [], mcq: e.mcq ?? null, mains: e.mainsPrompt ?? null, glossary: c.glossary ?? [] };
}

// --- Numbers for the home page -----------------------------------------------------------------------------------
export const totals = {
  notes: count('notes'), frames: count('mains-answer-writing'), cases: count('ethics-case-studies'), essays: count('essay-topics'),
  judgments: count('landmark-judgments'), schemes: count('government-schemes'), glossary: count('glossary'),
  caDays: DAYS.length, caCards: DAYS.reduce((n, d) => n + d.cards.length, 0),
  terms: pagesIn('glossary').reduce((n, p) => n + (p.data.terms?.length ?? 0), 0),
};
