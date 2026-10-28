# Aspiran web

The home page for aspiran.in (formerly UPSC Pods). Astro, static, one page plus a 404.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

- Copy (English + Hindi): `src/i18n.ts`
- Page: `src/pages/index.astro`
- Look and animation: `src/styles/global.css`
- Behaviour (language, theme, Chotu moves, calculator): `src/scripts/site.ts`
- Chotu: `src/components/Chotu.astro`
- Videos and posters: `public/media/`
- Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`

To publish it, follow `GO-LIVE.md`.
