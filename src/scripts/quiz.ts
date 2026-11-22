// Questions you can answer on the page (PYQs, current-affairs MCQs). Markup: .mcq[data-answer] with .mcq-opts buttons
// [data-i], an optional .mcq-sure row (buttons [data-sure="guess|fair|certain"]) and a .mcq-reveal block.
// Pick an option; where there is a "How sure?" row (the app's own habit, shown on PYQs), say how sure; then the answer
// shows. Chotu (components/Dock.astro) says what it means and how the app would follow it up. Nothing is stored.
const HI = document.documentElement.lang === 'hi';
const t = (en: string, hi: string) => (HI ? hi : en);
const ph = (n: string, p: Record<string, unknown> = {}) => (window as any).posthog?.capture?.(n, p);

const LINES = {
  rightSure: t("Right, and you knew it. In the app I'd still bring it back in a few weeks, so it stays that way.", 'सही, और आपको पक्का पता था। ऐप में मैं इसे कुछ हफ़्तों बाद फिर पूछूँगा, ताकि ऐसा ही रहे।'),
  rightGuess: t("Right, but it was a guess. Guesses don't hold up on exam day. Join free and I'll make it a sure one.", 'सही, पर तुक्का था। तुक्के एग्ज़ाम में साथ नहीं देते। फ़्री में जुड़िए, मैं इसे पक्का करवा दूँगा।'),
  wrongSure: t('Sure, and wrong: exactly what negative marking punishes. Aspiran finds these for you before the exam does.', 'पक्का था, पर ग़लत: नेगेटिव मार्किंग यही पकड़ती है। Aspiran ये सवाल एग्ज़ाम से पहले ढूँढकर देता है।'),
  wrongGuess: t("No harm, it was a guess, and now you know. Join free and I'll ask you again in 3 days.", 'कोई बात नहीं, अंदाज़ा था, अब पता चल गया। फ़्री में जुड़िए, मैं 3 दिन बाद फिर पूछूँगा।'),
  right: t('Correct! Want three like this with your chai every morning? Join free.', 'सही! रोज़ सुबह चाय के साथ ऐसे तीन सवाल चाहिए? फ़्री में जुड़िए।'),
  wrong: t('Missed it. In the app, a missed fact comes back tomorrow, and again, until it sticks.', 'चूक गए। ऐप में छूटा हुआ तथ्य कल फिर आता है, और फिर, जब तक याद न हो जाए।'),
};

const T = { done: 0, right: 0, wrong: 0, guess: 0 };

function finish(box: HTMLElement, chosen: number, sure: string | null) {
  const ans = Number(box.dataset.answer);
  const right = chosen === ans;
  box.querySelectorAll<HTMLButtonElement>('.mcq-opts button').forEach((b) => {
    b.disabled = true;
    const i = Number(b.dataset.i);
    if (i === ans) b.classList.add('right');
    else if (i === chosen) b.classList.add('wrong');
  });
  const out = box.querySelector<HTMLElement>('.mcq-out');
  if (out) out.textContent = right ? t('Correct.', 'सही जवाब।') : t('Not this one.', 'यह नहीं।');
  box.querySelector<HTMLElement>('.mcq-reveal')?.removeAttribute('hidden');
  box.dataset.done = '1';
  let say = sure ? (right ? (sure === 'guess' ? LINES.rightGuess : LINES.rightSure) : (sure === 'certain' ? LINES.wrongSure : LINES.wrongGuess)) : (right ? LINES.right : LINES.wrong);
  ph('site_answered', { kind: box.dataset.kind, right, sure });
  // The paper's private tally (components/viz/Tally.astro): marks as UPSC counts them, 2 per right, −⅔ per wrong.
  const tally = document.getElementById('tally');
  if (tally && box.dataset.kind === 'pyq') {
    T.done++; if (right) { T.right++; if (sure === 'guess') T.guess++; } else T.wrong++;
    tally.hidden = false;
    const set = (k: string, v: number | string) => { const el = tally.querySelector(`[data-t="${k}"]`); if (el) el.textContent = String(v); };
    set('done', T.done); set('right', T.right); set('guess', T.guess); set('net', (Math.round((T.right * 2 - T.wrong * (2 / 3)) * 100) / 100).toString());
    if (T.done % 5 === 0) {
      say = t(`${T.done} done, ${T.right} right${T.guess ? `, ${T.guess} of them guesses` : ''}. In the app I keep this for every question, and bring back the guesses.`,
        `${T.done} हल, ${T.right} सही${T.guess ? `, जिनमें ${T.guess} तुक्के` : ''}। ऐप में मैं हर सवाल का यही हिसाब रखता हूँ, और तुक्के वाले सवाल दोबारा पूछता हूँ।`);
    }
  }
  dispatchEvent(new CustomEvent('chotu', { detail: { say } }));
}

document.querySelectorAll<HTMLElement>('.mcq[data-answer]').forEach((box) => {
  let chosen = -1;
  const sureRow = box.querySelector<HTMLElement>('.mcq-sure');
  box.querySelectorAll<HTMLButtonElement>('.mcq-opts button').forEach((b) => b.addEventListener('click', () => {
    if (box.dataset.done) return;
    chosen = Number(b.dataset.i);
    box.querySelectorAll('.mcq-opts button').forEach((x) => x.classList.toggle('picked', x === b));
    if (sureRow) { sureRow.hidden = false; sureRow.querySelector('button')?.focus({ preventScroll: true }); }
    else finish(box, chosen, null);
  }));
  sureRow?.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => {
    if (box.dataset.done || chosen < 0) return;
    sureRow.querySelectorAll('button').forEach((x) => { (x as HTMLButtonElement).disabled = true; x.classList.toggle('picked', x === b); });
    finish(box, chosen, b.dataset.sure ?? null);
  }));
});

// Reading the "test yourself" answers on a note, or a hidden part of a case, counts as effort: Chotu says so.
document.querySelectorAll<HTMLDetailsElement>('details[data-chotu]').forEach((d) => d.addEventListener('toggle', () => {
  if (d.open && !d.dataset.told) { d.dataset.told = '1'; dispatchEvent(new CustomEvent('chotu', { detail: { say: d.dataset.chotu } })); }
}));
export {};
