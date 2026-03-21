# Site-wide footer & estimates

- **Main estimate form** lives in the footer: `<section id="contact" class="section contact footer-estimate">…</section>`.
- **All “schedule / free estimate / request estimate” CTAs** should use `href="#contact"` so they scroll to that form on any page.
- When you add new HTML pages, **copy the same `<footer>…</footer>` and `footer-support` block** from `index.html` so `#contact` always exists.

---

# Homepage build (JSON-driven content)

## Project layout

| Path | Purpose |
|------|---------|
| **`shared/homepage-content.json`** | **Source of truth for homepage copy**—headlines, CTAs, nav, services, FAQs, reviews, cities, stats, contact/footer text, media paths, etc. **`business`** holds NAP, site URL, short/long descriptions, hours, founding date, and **logo paths** (`logoHorizontalBlack`, `logoHorizontalWhite`). **`theme`** holds **white-label branding**: `colors` (maps to `:root` vars like `--color-bg`, `--color-accent`; JSON key **`primary`** → `--color-dark`), `fonts` (`heading`, `body`), `shadows` (`default`, `large`). Build injects `<style id="site-theme-vars">` after `styles.css` (see `scripts/homepage_render.py` → `themeCss`). **`forms`**: `recaptchaSiteKey` (reCAPTCHA **v3 site** key, public), `submitPath` (default `/api/lead`); webhook + **secret** key only in Vercel env (see **Lead forms** below). **`businessCategories`**, **`keywords`**, and **`businessListings`** (Google/Bing/social URLs) are for SEO and consistency—keep in sync with live profiles. Each **photo** includes a **`location`** (or `posterLocation`, `avatarLocation`, etc.) derived from the filename / context. **`layoutBackgrounds`** documents hero, unique-points, and services section CSS background images (keep in sync with `styles.css`). **Project carousel:** the text next to 📍 is **`projects.slides[].location`** (rendered as `.project-location-label`, also on `data-location`). |
| **`scripts/homepage_render.py`** | Builds each section’s HTML (structure, classes, SVG icons). Edit here only when changing layout/components—not wording. |
| **`src/index.html`** | Assembly file: `<!-- @homepage:section-name -->` markers + order of sections. |
| **`src/partials/head.html`** | `<head>`: uses `{{title}}`, `{{metaDescription}}`, and `{{themeCss}}` filled from JSON at build time. |
| **`scripts/build-html.py`** | Loads JSON → injects rendered sections → fills `{{placeholders}}` → writes root **`index.html`**. |
| **`index.html`** (root) | **Deploy** this file. |
| **`shared/site.json`** | **Legacy / unused by build.** All data now lives in `homepage-content.json`; you can delete `site.json` if you no longer need it. |
| **`Sanity (MHG)/schemaTypes/`** | **Sanity Studio** — schemas derived from **`shared/homepage-content.json`** (see **`SCHEMAS.md`**). Documents: **`siteSettings`** (global business keys), **`homePage`** (page sections). Merge both to recreate the full JSON shape. |

## How to edit homepage content

1. Edit **`shared/homepage-content.json`** for almost all text, lists, links, and image paths.
2. Run **`python3 scripts/build-html.py`** (or **`npm run build`**).
3. To change **section order** or **drop a section**, edit **`src/index.html`** (add/remove/reorder `<!-- @homepage:… -->` lines).
4. To change **HTML structure** (new wrapper, extra class), edit **`scripts/homepage_render.py`** for that section’s `render_*` function.

**Main nav (`header.navItems`):** Each item is either `{ "label", "href" }` (single link) or `{ "label", "dropdown": [ { "label", "href" }, ... ] }` (parent opens a menu; parent is a **button**, not a page). **Dropdown parents** are “Services” and “About Us”; **all other** entries use **root-relative** URLs (e.g. `/gutter-repair.html`) for dedicated pages—create those files or adjust `href`s when routing changes. Desktop: hover/focus opens dropdowns. Mobile (≤1120px): hamburger menu, then tap parent to expand. Styles: `.nav-dropdown` in **`styles.css`**; mobile submenu toggles in **`script.js`**.

**Section markers** (see `homepage_render.py` `RENDERERS`):

`header`, `hero`, `projects`, `why-choose`, `services`, `about`, `unique-points`, `stats`, `contact-banner`, `reviews`, `service-area`, `team`, `faq`, `footer`, `typed-config`

## Hero typing animation

- Phrases come from **`hero.typedPhrases`** in JSON.
- Build outputs `<script type="application/json" id="homepage-typed-phrases">…</script>`; **`script.js`** reads that at runtime.

## How to rebuild

After any change to `shared/homepage-content.json`, `src/`, or `scripts/homepage_render.py`:

```bash
python3 scripts/build-html.py
```

Or:

```bash
npm run build
```

Optional auto-rebuild:

```bash
npm run watch
```

**Preview/deploy the generated `index.html` at the project root** (not `src/index.html` alone).

## Vercel

- **`vercel.json`** sets **`outputDirectory` to `.`** because the live site files (`index.html`, `styles.css`, `script.js`, `Media (MHG)/`, etc.) sit at the **repo root**, not in a `public/` folder. That fixes: *No Output Directory named "public" found*.
- **Build command** is **`npm run build`** (runs `python3 scripts/build-html.py`). Vercel’s build image must have **Python 3** available; if the build fails, either add a Python runtime in Project Settings or build locally, commit `index.html`, and use an empty / no-op build on Vercel.
- In the Vercel dashboard, you can leave **Output Directory** as overridden by `vercel.json`, or set it to **`.`** manually (same result).
- **Lead forms (hero + footer):** `script.js` POSTs JSON to **`/api/lead`** (see **`api/lead.js`**). Configure in Vercel **Environment Variables** (see **`.env.example`**):
  - **`ZAPIER_WEBHOOK_URL`** — Zapier *Catch Hook* “Custom” webhook URL (keep this secret; do **not** put it in `homepage-content.json`).
  - **`RECAPTCHA_SECRET_KEY`** — Google reCAPTCHA **v3** *secret* key. The **site** key goes in **`shared/homepage-content.json`** → **`forms.recaptchaSiteKey`** (public, embedded in HTML). Optional **`RECAPTCHA_MIN_SCORE`** (default `0.35`).
- If **`RECAPTCHA_SECRET_KEY`** is unset, the API skips verification (handy for local testing); use both keys in production.
- Zapier receives JSON: `formSource`, `name`, `email`, `phone`, `location`, `message`, `submittedAt`, `pageUrl`.
- **Astro** (`astro-site/`): set **`PUBLIC_RECAPTCHA_SITE_KEY`** in `.env` or Vercel for the same site key; **`api/lead`** still lives at the **repo root** when the whole project is deployed to Vercel.
- **404 `NOT_FOUND` on `/api/lead`:** (1) Vercel **Root Directory** must be the **repository root** (the folder that contains **`api/lead.js`** and **`vercel.json`**), not `astro-site/`. (2) **`api/lead.js`** must be **committed and pushed** to GitHub. (3) After deploy, opening `/api/lead` in the browser sends **GET** → you should see **`405`** + JSON (`method_not_allowed`), not **404**. **404** means the function was not deployed.

## Includes (head only)

Only **`src/partials/head.html`** is still pulled in via:

```html
<!-- @include partials/head.html -->
```

Paths are relative to **`src/`**.
