# Aspiran web

The home page for aspiran.in. Astro, static, one page plus a 404.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

- Home page (the long "rooms" page, English for now): `src/pages/index.astro` (copy), `src/styles/home.css` (look),
  `src/scripts/home.ts` (Chotu's walk-along lines and questions, the star map, the quizzes)
- Chotu's free-text replies and saving visitors' details use the app server's `/web/chotu` and `/web/lead`
  (`server/src/web.ts` in the app repo). Without them the page still works; the seat form falls back to WhatsApp.
- Legal pages and 404: `src/layouts/LegalLayout.astro`, `src/styles/global.css`, copy in `src/i18n.ts`
- The old home page's script `src/scripts/site.ts` is no longer used by the home page
- Chotu: `src/components/Chotu.astro`
- Videos and posters: `public/media/`
- Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`

To publish it, follow `GO-LIVE.md`.
