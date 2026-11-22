// Every way into the app from the site (22 Nov 2026). Join = the app with no hash: a new visitor lands on its first
// screen, which signs them up. Tour = the 6-minute showreel (it ends on Join free). UTM tags say which page sent them.
import type { Lang } from './content';
const base = (where: string, lang: Lang) => `https://app.aspiran.in/app/?utm_source=site&utm_medium=${encodeURIComponent(where)}${lang === 'hi' ? '&lang=hi' : ''}`;
export const joinUrl = (where: string, lang: Lang) => base(where, lang);
export const tourUrl = (where: string, lang: Lang) => `${base(where, lang)}#tour/path-pol-federalism`;
export const tryUrl = (where: string, lang: Lang) => `${base(where, lang)}#try/path-pol-federalism`;
/** A screen from the showreel, captured 22 Nov 2026 (public/media/tour/<name>-<lang>.webp, 520×961). */
export type Shot = 'guess' | 'read' | 'gov' | 'sort' | 'gst' | 'pyq' | 'mains' | 'desk' | 'essay' | 'cards' | 'pods' | 'chotu' | 'more';
export const shot = (name: Shot, lang: Lang) => `/media/tour/${name}-${lang}.webp`;
export const SHOT_NAME: Record<Shot, Record<Lang, string>> = {
  guess: { en: 'Guess first', hi: 'पहले अंदाज़ा' }, read: { en: 'Smart reading', hi: 'स्मार्ट रीडिंग' }, gov: { en: "The Governor's desk", hi: 'राज्यपाल की मेज़' },
  sort: { en: 'Sort the lists', hi: 'लिस्ट छाँटिए' }, gst: { en: 'The GST vote', hi: 'GST वोट' }, pyq: { en: 'Real PYQs', hi: 'असली PYQ' },
  mains: { en: 'Mains plan', hi: 'मेन्स प्लान' }, desk: { en: 'Answer marking', hi: 'आंसर की जाँच' }, essay: { en: 'Essay', hi: 'एसे' },
  cards: { en: 'Memory cards', hi: 'मेमोरी कार्ड' }, pods: { en: 'Your pod', hi: 'आपका पॉड' }, chotu: { en: 'Chotu', hi: 'छोटू' }, more: { en: 'And more', hi: 'और भी' },
};
