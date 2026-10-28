# Make aspiran.in live

Plain steps, one at a time. Commands are for Terminal on a Mac (they also work in Git Bash on Windows).
Time needed: about 30 minutes, plus waiting for DNS (a few minutes to a few hours).

You need: a GitHub account (srsrsrsr9), Node.js 20 or newer (`node -v` to check), and
access to wherever the domain aspiran.in is registered.

---

## Part 1. Check it on your computer

1. Unzip `aspiran-web.zip`, then open Terminal in that folder:
   ```
   cd ~/Downloads/aspiran-web
   ```
2. Install and start it:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:4321 in your browser.
   Check: the Hindi button works, the Chotu cups move, both videos play, and the WhatsApp
   buttons open a chat with +91 98766 56573 and a ready message.
4. Press `Ctrl+C` in Terminal to stop it.

If something looks wrong, tell me what you see and I'll fix it before you go further.

## Part 2. Put it on GitHub (a new repo, not snpwb)

1. On github.com click **New repository**. Name it `aspiran-web`. Choose **Public**
   (free GitHub Pages needs a public repo). Do not tick "Add a README". Click **Create**.
2. Back in Terminal, in the same folder, run these one at a time:
   ```
   git init
   git add .
   git commit -m "Aspiran home page"
   git branch -M main
   git remote add origin https://github.com/srsrsrsr9/aspiran-web.git
   git push -u origin main
   ```
   If it asks you to sign in, use your GitHub login (or a personal access token).

## Part 3. Turn on GitHub Pages

1. In the repo on GitHub: **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Go to the **Actions** tab. A run called "Deploy Aspiran to GitHub Pages" starts on its own
   (if not, open it and click **Run workflow**). Wait for the green tick, about 2 minutes.
4. Your site is now at https://srsrsrsr9.github.io/aspiran-web/ . It may look unstyled there,
   because it is built for the custom domain. That is normal. Carry on to Part 4.

## Part 4. Point aspiran.in at it

Do this where the domain is registered (GoDaddy, Namecheap, Cloudflare, etc.), in the DNS settings.
Delete any existing A or AAAA records for `@` and any parking-page records first. Then add:

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | srsrsrsr9.github.io    |

(Optional, for IPv6: AAAA records for `@` pointing to 2606:50c0:8000::153, 2606:50c0:8001::153,
2606:50c0:8002::153 and 2606:50c0:8003::153. If GitHub's docs show different addresses, use theirs.)

If the domain is on Cloudflare, set these records to **DNS only** (grey cloud), not proxied.

Then in the repo: **Settings** → **Pages** → **Custom domain** → type `aspiran.in` → **Save**.
The file `public/CNAME` already says `aspiran.in`, so it will stick across deploys.
When GitHub shows "DNS check successful", tick **Enforce HTTPS**. The certificate can take up
to an hour. Until then, https may show a warning. That is normal.

## Part 5. Check it live

Open https://aspiran.in and https://www.aspiran.in on your phone (on mobile data, not Wi-Fi).
Tap the WhatsApp button once to confirm the number and message. Paste the link into WhatsApp
to see the preview card.

## Updating the site later

- All the words (English and Hindi) are in `src/i18n.ts`. Change them there.
- Phone number is `WA_NUMBER` at the top of that file.
- After any change: `git add .`, `git commit -m "what changed"`, `git push`. The site redeploys in about 2 minutes.

## Before you share it widely (open items)

1. **Fill the legal placeholders.** `/privacy` and `/terms` are drafts. Search `src/pages/privacy.astro` and
   `terms.astro` for text in [square brackets] (legal entity name, address, grievance contact, retention period,
   governing law) and have a lawyer read them. The site shows a "Draft for legal review" bar on both pages until you
   delete `<div class="draftbar">` in `src/layouts/LegalLayout.astro`.
2. **Save the form answers somewhere.** Right now the form opens WhatsApp with the answers filled in, so you see them
   in the chat. To also keep a list, make a free Formspree or Web3Forms form and paste its URL into `FORM_ENDPOINT`
   in `src/i18n.ts`. If you do, name the service on the Privacy page.
3. **Videos.** "Akela Nahi" still has "UPSC Pods" printed inside it. Re-render it as Aspiran, then replace
   `public/media/akela-nahi.mp4` and its poster. Vocals are still to be recorded.
4. **Analytics.** Paste your Umami website ID into `UMAMI_WEBSITE_ID` in `src/layouts/BaseLayout.astro`.
   Every button reports where it was tapped (`cta-join`, `cta-whatsapp`, `form-submit`, `helpline-14416`).
5. **Facts to confirm.** Plus at ₹9,999 a year, "from December 2026", "1 in 540 selected", "eligible candidates can
   try Plus free", "free forever for the community", and "Chotu is up all night" (this overrides the 23:30 to 07:00
   quiet hours in the app's CLAUDE.md). Also what you will actually do for people who join before the app is out:
   the page says "we reply with your pod batch and what to expect before the app is out".
6. **Removed on purpose.** The footer disclaimer and the Tele-MANAS line were removed as you asked. The
   "not affiliated with UPSC" statement is still in the FAQ and on the Terms page, and the Tele-MANAS 14416 call button
   is in the Calm card. If a lawyer wants the disclaimer back in the footer, it is one line in `SiteFooter.astro`.
7. **Hindi pages.** Hindi is a toggle on the same page. A separate /hi/ page for search engines is a good later step.

## If you would rather use Netlify (like snpwb's README says)

Skip Parts 2 to 4's Pages steps. On netlify.com: **Add new site** → **Import from Git** → pick the repo.
Build command `npm run build`, publish directory `dist`. Then add `aspiran.in` under **Domain management**
and use the DNS values Netlify shows you. Delete `.github/workflows/deploy.yml` and `public/CNAME` if you do.

## Something went wrong?

- Actions run is red: open it, copy the red error text, and send it to me.
- Site shows a GitHub 404 on aspiran.in: DNS has not caught up yet, or Pages source is not set to GitHub Actions.
- "Domain is already taken": another repo uses aspiran.in under Pages. Remove it there first.
