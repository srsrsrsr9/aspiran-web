// Client behaviour: language toggle, theme toggle, Chotu's moves, attempts calculator.
// No cookies, nothing leaves the page.

type Lang = 'en' | 'hi';
type Strings = { lines: string[]; calc: Record<string, any>; cats: string[]; head: string; labels: string[] };
const data = JSON.parse(document.getElementById('i18n')!.textContent || '{}') as {
  waNum: string;
  endpoint: string;
  waEn: string;
  waHi: string;
  en: Strings;
  hi: Strings;
};

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lang: Lang = 'en';
try {
  const saved = localStorage.getItem('aspiran-lang');
  if (saved === 'hi' || saved === 'en') lang = saved;
} catch {}

let g = 0; // hero + closing Chotu move
let g2 = 0; // main Chotu move
let line = 0;
let heroLine = 3;

const state = { yob: 1998, used: 2, cat: 'gen' as 'gen' | 'obc' | 'scst' };

function applyLang() {
  document.documentElement.lang = lang;
  $$('[data-hi]').forEach((el) => {
    if (el.dataset.en === undefined) el.dataset.en = el.textContent || '';
    el.textContent = lang === 'hi' ? el.dataset.hi! : el.dataset.en!;
  });
  $$('[data-hi-aria]').forEach((el) => {
    if (el.dataset.enAria === undefined) el.dataset.enAria = el.getAttribute('aria-label') || '';
    el.setAttribute('aria-label', lang === 'hi' ? el.dataset.hiAria! : el.dataset.enAria!);
  });
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $$<HTMLAnchorElement>('a[data-wa]').forEach((a) => (a.href = lang === 'hi' ? data.waHi : data.waEn));
  setLines();
  calc();
}

function setLines() {
  const L = data[lang].lines;
  const a = $('#chotu-line');
  const b = $('#hero-line');
  if (a) pop(a, L[line % L.length]);
  if (b) pop(b, L[heroLine % L.length]);
}

function pop(el: HTMLElement, text: string) {
  el.textContent = text;
  if (calm) return;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

function move(group: string, n: number) {
  $$<SVGElement>(`[data-chotu="${group}"] .ch-gest`).forEach((el) => {
    el.setAttribute('class', `ch-gest gst${n}`);
  });
}

// attempts and age calculator (same rules as the UPSC Pods site)
function calc() {
  const C = data[lang].calc;
  const big = $('#calc-big');
  const rows = $('#calc-rows');
  const note = $('#calc-note');
  if (!big || !rows) return;
  if (note) note.hidden = true;
  const yob = Math.max(1980, Math.min(2010, state.yob || 1998));
  const used = Math.max(0, state.used || 0);
  const rule = { gen: [6, 32], obc: [9, 35], scst: [Infinity, 37] }[state.cat];
  const lastByAge = yob + rule[1] - 1;
  const first = 2027;
  const left = Math.max(0, rule[0] - used);
  if (lastByAge < first || left === 0) {
    big.textContent = C.none;
    rows.innerHTML = '';
    return;
  }
  const last = left === Infinity ? lastByAge : Math.min(lastByAge, first + left - 1);
  const nStr = left === Infinity ? '∞' : String(Math.min(left, last - first + 1));
  big.textContent =
    nStr === '∞'
      ? C.unlimited.replace('{last}', String(last))
      : (nStr === '1' ? C.left1 : C.leftN).replace('{n}', nStr).replace('{last}', String(last));
  if (note && left !== Infinity && last - first + 1 < left) {
    note.textContent = C.ageNote;
    note.hidden = false;
  }
  const vals = ['CSE 2027 · 23 May', nStr === '∞' ? C.nolimit : nStr, 'CSE ' + last];
  rows.replaceChildren(
    ...C.rows.map((label: string, i: number) => {
      const r = document.createElement('div');
      r.className = 'row';
      const a = document.createElement('span');
      a.textContent = label;
      const b = document.createElement('b');
      b.textContent = vals[i];
      r.append(a, b);
      return r;
    }),
  );
}

// wiring
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const l = t.closest<HTMLElement>('[data-lang]');
  if (l) {
    lang = l.dataset.lang as Lang;
    try { localStorage.setItem('aspiran-lang', lang); } catch {}
    applyLang();
    return;
  }
  if (t.closest('#themebtn')) {
    const root = document.documentElement;
    const dark =
      root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('aspiran-theme', next); } catch {}
    return;
  }
  if (t.closest('#chotu-tap')) {
    g2 = (g2 + 1) % 7;
    line = (line + 1) % data[lang].lines.length;
    move('chotu', g2);
    setLines();
    return;
  }
  const c = t.closest<HTMLElement>('[data-cat]');
  if (c) {
    state.cat = c.dataset.cat as typeof state.cat;
    $$('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b === c)));
    calc();
  }
});
$('#yob')?.addEventListener('input', (e) => { state.yob = parseInt((e.target as HTMLInputElement).value, 10); calc(); });
$('#used')?.addEventListener('input', (e) => { state.used = parseInt((e.target as HTMLInputElement).value, 10); calc(); });

if (!calm) {
  setInterval(() => {
    g = (g + 1) % 7;
    heroLine = (heroLine + 1) % data[lang].lines.length;
    move('hero', g);
    move('final', (g + 3) % 7);
    const b = $('#hero-line');
    if (b) pop(b, data[lang].lines[heroLine]);
  }, 4200);
  setInterval(() => {
    g2 = (g2 + 1) % 7;
    line = (line + 1) % data[lang].lines.length;
    move('chotu', g2);
    const a = $('#chotu-line');
    if (a) pop(a, data[lang].lines[line]);
  }, 5600);
}

// early-access form: builds a filled-in WhatsApp message (no blanks), optionally also posts to FORM_ENDPOINT
$('#joinform')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target as HTMLFormElement;
  const v = (n: string) => ((f.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement)?.value || '').trim();
  if (v('company')) return; // honeypot: bots fill this, people never see it
  const D = data[lang];
  const parts = [D.head];
  const name = v('name');
  if (name) parts.push(`${D.labels[0]}: ${name}.`);
  parts.push(`${D.labels[1]}: ${v('attempt')}.`, `${D.labels[2]}: ${v('medium')}.`, `${D.labels[3]}: ${v('stage')}.`, `${D.labels[4]}: ${v('phone')}.`);
  const text = parts.join(' ');
  const url = `https://wa.me/${data.waNum}?text=${encodeURIComponent(text)}`;
  const w = window.open(url, '_blank', 'noopener');
  const st = $<HTMLAnchorElement>('#fstatus');
  if (st) { st.href = url; st.hidden = false; st.removeAttribute('data-wa'); if (w) st.hidden = false; }
  const um = (window as any).umami;
  if (um) um.track('form-submit', { attempt: v('attempt'), medium: v('medium'), stage: v('stage'), phone: v('phone') });
  if (data.endpoint) {
    try {
      fetch(data.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, attempt: v('attempt'), medium: v('medium'), stage: v('stage'), phone: v('phone'), lang }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }
});

// video: big play button on the poster, hidden once playing
$$('.vwrap').forEach((w) => {
  const vid = w.querySelector('video')!;
  const btn = w.querySelector<HTMLButtonElement>('.vplay')!;
  btn.addEventListener('click', () => { vid.play(); vid.focus(); });
  vid.addEventListener('play', () => w.classList.add('playing'));
  vid.addEventListener('ended', () => w.classList.remove('playing'));
});

// hide the floating WhatsApp button while the form is on screen
const joinEl = document.getElementById('join');
const pillEl = document.getElementById('wa-float');
if (joinEl && pillEl && 'IntersectionObserver' in window) {
  new IntersectionObserver((es) => es.forEach((en) => pillEl.classList.toggle('hide', en.isIntersecting)), { threshold: 0.15 }).observe(joinEl);
}

applyLang();
