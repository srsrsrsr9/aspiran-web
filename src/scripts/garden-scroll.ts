// The whole UPSC syllabus as the app's creeper garden (scripts/garden/, copied from the app). Every leaf starts dark;
// scrolling through the band plays a year of prep: each syllabus line is read, recalled a few weeks later and, for some,
// used in an answer later still. A sketch, the same on every visit (seeded by topic), not anyone's data.
import { garden, vinesOf, countsOf, jitter } from './garden/vine.js';
import { papersFor, nodeId } from './garden/syllabus.js';

const HI = document.documentElement.lang === 'hi';
const t = (en: string, hi: string) => (HI ? hi : en);
const $ = (s: string) => document.querySelector(s) as HTMLElement | null;

(() => {
  const frame = $('#garden-frame'), wrap = $('#garden-wrap'), month = $('#garden-month'), tip = $('#garden-tip');
  if (!frame || !wrap || !month || !tip) return;
  const vines = vinesOf(papersFor(null), nodeId, () => 'none', false);
  const total = countsOf(vines).lines;
  const svg = garden(vines, { height: 430, label: t('The whole UPSC syllabus as a creeper garden: nine papers, every line a leaf, lighting up over a year', 'UPSC का पूरा सिलेबस एक बेल की तरह: नौ पेपर, हर लाइन एक पत्ती, साल भर में जगमगाती हुई') });
  svg.querySelectorAll('.vine').forEach((g: Element) => { g.removeAttribute('role'); g.removeAttribute('tabindex'); g.removeAttribute('aria-label'); });
  frame.append(svg);
  const paperOf: Record<string, string> = Object.fromEntries(vines.flatMap((v: any) => v.branches.flatMap((b: any) => b.leaves.map((l: any) => [l.node, v.label]))));
  const leaves = [...svg.querySelectorAll<SVGGElement>('.vine-leaf')].filter((l) => l.dataset.node).map((el) => {
    const node = el.dataset.node!, a = jitter(node + 'm') + 0.5, b = jitter(node + 'r') + 0.5, c = jitter(node + 'u') + 0.5;
    const met = 0.03 + a * 0.72, recall = met + 0.1 + b * 0.3, use = c < 0.4 ? recall + 0.08 + c * 0.5 : 2;
    return { el, node, line: el.dataset.line ?? '', met, recall, use, state: 'none' };
  });
  // "Can use in an answer" is a marigold at the leaf's tip, as in the app.
  const NS = 'http://www.w3.org/2000/svg';
  leaves.filter((l) => l.use < 2).forEach((l) => {
    const leafPath = l.el.querySelector('path');
    if (!leafPath) return;
    const bb = leafPath.getBBox();
    const size = Math.max(2.2, Math.min(bb.width, 14) * 0.3);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'vine-bloom');
    g.setAttribute('transform', `translate(${(bb.x + bb.width * 0.92).toFixed(1)} ${(bb.y + bb.height * 0.5).toFixed(1)})`);
    const inner = document.createElementNS(NS, 'g');
    inner.setAttribute('class', 'bloom-open');
    for (let k = 0; k < 5; k++) {
      const e = document.createElementNS(NS, 'ellipse');
      e.setAttribute('cx', '0'); e.setAttribute('cy', (-size * 0.55).toFixed(2));
      e.setAttribute('rx', (size * 0.38).toFixed(2)); e.setAttribute('ry', (size * 0.55).toFixed(2));
      e.setAttribute('transform', `rotate(${k * 72})`);
      inner.append(e);
    }
    const eye = document.createElementNS(NS, 'circle');
    eye.setAttribute('r', (size * 0.32).toFixed(2)); eye.setAttribute('class', 'vine-bloom-eye');
    inner.append(eye);
    g.append(inner);
    l.el.append(g);
  });
  const label: Record<string, string> = HI ? { none: 'अभी नहीं', met: 'पढ़ लिया', recall: 'याद है', use: 'आंसर में लिख सकते हैं' } : { none: 'not yet', met: 'read', recall: 'can recall', use: 'can use in an answer' };
  const paint = (p: number) => {
    let m = 0, r = 0, u = 0;
    for (const l of leaves) {
      const st = p >= l.use ? 'use' : p >= l.recall ? 'recall' : p >= l.met ? 'met' : 'none';
      if (st !== l.state) { l.el.classList.remove('none', 'met', 'recall', 'use'); l.el.classList.add(st); l.state = st; }
      if (st !== 'none') m++; if (st === 'recall' || st === 'use') r++; if (st === 'use') u++;
    }
    const mo = Math.min(12, Math.round(p * 12));
    month.textContent = mo === 0 ? t(`MONTH 0 · ${total} SYLLABUS LINES, ALL DARK`, `महीना 0 · सिलेबस की ${total} लाइनें, सब अँधेरी`)
      : t(`MONTH ${mo} · ${m} READ · ${r} REMEMBERED · ${u} READY FOR ANSWERS`, `महीना ${mo} · ${m} पढ़ीं · ${r} याद · ${u} आंसर के लिए तैयार`);
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { paint(1); }
  else {
    const onScroll = () => {
      const b = wrap.getBoundingClientRect();
      const span = b.height - innerHeight * 0.8;
      paint(Math.max(0, Math.min(1, (-b.top + innerHeight * 0.1) / Math.max(span, 1))));
    };
    addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
    onScroll();
  }
  svg.addEventListener('click', (e: Event) => {
    const el = (e.target as Element).closest('.vine-leaf') as SVGGElement | null;
    const l = leaves.find((x) => x.el === el);
    if (l) tip.textContent = `${paperOf[l.node] ?? ''} · ${l.line}: ${label[l.state]}`;
  });
})();
export {};
