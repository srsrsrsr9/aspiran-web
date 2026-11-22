// The Binge feed (components/BingeFeed.astro): tap any poster on the page ([data-short]) and a full-screen, swipe-up
// list of shorts opens at that one. Site rules: nothing plays by itself (each short starts on a tap, and the next one waits
// for a tap too), sound stays off until the viewer turns it on (that choice then holds for the visit), captions are on,
// reduced motion means no smooth scrolling. After a short ends, its one quick question shows. Every 4th slot is a Join
// free card. Nothing is stored.
type Item = { id: string; t: string; d: number; v: string; c: string; p: string; u: string; q: { q: string; options: string[]; answerIndex: number; why: string } | null };
const raw = document.getElementById('feed-data')?.textContent;
const feed = document.getElementById('feed');
if (raw && feed) {
  const { items, words: W, join } = JSON.parse(raw) as { items: Item[]; words: Record<string, string>; join: string };
  const list = feed.querySelector<HTMLElement>('.feed-list')!;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ph = (n: string, p: Record<string, unknown> = {}) => (window as any).posthog?.capture?.(n, p);
  const say = (text: string) => window.dispatchEvent(new CustomEvent('chotu', { detail: { text } }));
  let soundOn = false;
  let watched = 0;
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
  const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

  // Build the slides once: shorts, with a Join card after every 4th.
  items.forEach((it, i) => {
    const s = el('section', 'slide');
    s.dataset.i = String(i);
    s.innerHTML = `<img class="slide-poster" src="${esc(it.p)}" alt="" loading="lazy" decoding="async">
      <button class="slide-play" type="button" aria-label="${esc(W.play)}: ${esc(it.t)}">▶</button>
      <div class="slide-foot"><h2>${esc(it.t)}</h2>
        <div class="slide-tools"><button class="slide-sound" type="button" aria-pressed="false">🔇 ${esc(W.sound)}</button>
        <a href="${esc(it.u)}">${esc(W.page)}</a></div></div>`;
    list.append(s);
    if ((i + 1) % 4 === 0 && i < items.length - 1) {
      const j = el('section', 'slide slide-join');
      j.innerHTML = `<div class="slide-join-in"><p class="kick">Aspiran</p><h2>${esc(W.joinH)}</h2><p>${esc(W.joinP)}</p>
        <a class="btn primary" href="${esc(join)}" data-cta="join" data-where="binge-feed">${esc(W.joinB)}</a><p class="small">${esc(W.keep)}</p></div>`;
      list.append(j);
    }
  });

  const slides = [...list.querySelectorAll<HTMLElement>('.slide[data-i]')];
  const stopAll = (except?: HTMLVideoElement) => list.querySelectorAll('video').forEach((v) => { if (v !== except) v.pause(); });

  function quiz(slide: HTMLElement, it: Item) {
    if (!it.q || slide.querySelector('.slide-quiz')) return;
    const q = it.q;
    const box = el('div', 'slide-quiz');
    box.innerHTML = `<p class="small">${esc(W.quick)}</p><p class="slide-q">${esc(q.q)}</p>` +
      q.options.map((o, k) => `<button type="button" data-k="${k}">${esc(o)}</button>`).join('') + `<p class="slide-why" hidden></p>`;
    box.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-k]');
      if (!b) return;
      const k = Number(b.dataset.k), right = k === q.answerIndex;
      box.querySelectorAll<HTMLButtonElement>('button[data-k]').forEach((x) => { x.disabled = true; const n = Number(x.dataset.k); if (n === q.answerIndex) x.classList.add('right'); else if (n === k) x.classList.add('wrong'); });
      const why = box.querySelector<HTMLElement>('.slide-why')!;
      why.hidden = false; why.textContent = `${right ? W.right : W.wrong} ${q.why} ${W.next}`;
      ph('binge_quiz', { id: it.id, right });
    });
    slide.querySelector('.slide-foot')!.before(box);
  }

  function play(slide: HTMLElement) {
    const it = items[Number(slide.dataset.i)];
    let v = slide.querySelector('video');
    if (!v) {
      v = el('video', 'slide-video');
      v.playsInline = true; v.preload = 'metadata'; v.poster = it.p; v.crossOrigin = 'anonymous';
      v.muted = !soundOn; v.controls = false;
      v.innerHTML = `<source src="${esc(it.v)}" type="video/mp4"><track kind="captions" src="${esc(it.c)}" srclang="${document.documentElement.lang}" label="Captions" default>`;
      v.addEventListener('click', () => (v!.paused ? v!.play() : v!.pause()));
      v.addEventListener('play', () => slide.classList.add('playing'));
      v.addEventListener('pause', () => slide.classList.remove('playing'));
      v.addEventListener('ended', () => {
        slide.classList.remove('playing'); slide.classList.add('ended'); watched++;
        ph('binge_watched', { id: it.id, watched });
        quiz(slide, it);
        if (watched === 2) say(document.documentElement.lang === 'hi' ? 'दो हो गए! ऐप में हर वीडियो के तथ्य बाद में छोटे सवालों में लौटते हैं, ताकि याद रहें।' : "That's two! In the app, every video's facts come back later as quick questions, so they stick.");
      });
      slide.querySelector('.slide-poster')!.after(v);
      v.textTracks[0] && (v.textTracks[0].mode = 'showing');
    }
    stopAll(v);
    slide.classList.remove('ended');
    v.play().catch(() => {});
    ph('binge_play', { id: it.id });
  }

  list.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const slide = t.closest<HTMLElement>('.slide[data-i]');
    if (!slide) return;
    if (t.closest('.slide-play')) play(slide);
    else if (t.closest('.slide-sound')) {
      soundOn = !soundOn;
      list.querySelectorAll('video').forEach((v) => (v.muted = !soundOn));
      list.querySelectorAll<HTMLButtonElement>('.slide-sound').forEach((b) => { b.setAttribute('aria-pressed', String(soundOn)); b.textContent = soundOn ? `🔊 ${W.mute}` : `🔇 ${W.sound}`; });
    }
  });

  // Pause whatever scrolls out of view. The next short does not start by itself.
  const io = new IntersectionObserver((es) => es.forEach((x) => { if (!x.isIntersecting) x.target.querySelector('video')?.pause(); }), { root: list, threshold: 0.4 });
  slides.forEach((s) => io.observe(s));

  let lastFocus: Element | null = null;
  function open(id: string) {
    const i = Math.max(0, items.findIndex((x) => x.id === id));
    lastFocus = document.activeElement;
    feed!.hidden = false;
    document.documentElement.classList.add('feed-open');
    slides[i].scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    slides[i].querySelector<HTMLButtonElement>('.slide-play')?.focus({ preventScroll: true });
    history.pushState({ feed: id }, '', `#watch-${id}`);
    ph('binge_open', { id });
  }
  function close(fromPop = false) {
    stopAll();
    feed!.hidden = true;
    document.documentElement.classList.remove('feed-open');
    (lastFocus as HTMLElement | null)?.focus?.({ preventScroll: true });
    if (!fromPop && location.hash.startsWith('#watch-')) history.back();
  }
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-short]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || !items.some((x) => x.id === a.dataset.short)) return;
    e.preventDefault();
    open(a.dataset.short!);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-feed-start]').forEach((b) => b.addEventListener('click', () => open(items[0].id)));
  feed.querySelector('[data-feed-close]')!.addEventListener('click', () => close());
  addEventListener('popstate', () => { if (!feed.hidden) close(true); });
  feed.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      list.scrollBy({ top: (e.key === 'ArrowDown' ? 1 : -1) * list.clientHeight, behavior: calm ? 'auto' : 'smooth' });
    }
  });
  if (location.hash.startsWith('#watch-')) history.replaceState(null, '', location.pathname);
}
