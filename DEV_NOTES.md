# Site-wide footer & estimates

- **Main estimate form** lives in the footer: `<section id="contact" class="section contact footer-estimate">…</section>`.
- **All “schedule / free estimate / request estimate” CTAs** should use `href="#contact"` so they scroll to that form on any page.
- When you add new HTML pages, **copy the same `<footer>…</footer>` and `footer-support` block** from `index.html` so `#contact` always exists.

---

# Homepage build (JSON-driven content)

## Project layout

| Path | Purpose |
|------|---------|
| **`shared/homepage-content.json`** | **Source of truth for homepage copy**—headlines, CTAs, nav, services, FAQs, reviews, cities, stats, contact/footer text, media paths, etc. **`business`** holds NAP, site URL, short/long descriptions, hours, founding date, and logo paths. **`businessCategories`**, **`keywords`**, and **`businessListings`** (Google/Bing/social URLs) are for SEO and consistency—keep in sync with live profiles. Each **photo** includes a **`location`** (or `posterLocation`, `avatarLocation`, etc.) derived from the filename / context. **`layoutBackgrounds`** documents hero, unique-points, and services section CSS background images (keep in sync with `styles.css`). **Project carousel:** the text next to 📍 is **`projects.slides[].location`** (rendered as `.project-location-label`, also on `data-location`). |
| **`scripts/homepage_render.py`** | Builds each section’s HTML (structure, classes, SVG icons). Edit here only when changing layout/components—not wording. |
| **`src/index.html`** | Assembly file: `<!-- @homepage:section-name -->` markers + order of sections. |
| **`src/partials/head.html`** | `<head>`: uses `{{title}}` and `{{metaDescription}}` filled from JSON at build time. |
| **`scripts/build-html.py`** | Loads JSON → injects rendered sections → fills `{{placeholders}}` → writes root **`index.html`**. |
| **`index.html`** (root) | **Deploy** this file. |
| **`shared/site.json`** | **Legacy / unused by build.** All data now lives in `homepage-content.json`; you can delete `site.json` if you no longer need it. |

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

## Includes (head only)

Only **`src/partials/head.html`** is still pulled in via:

```html
<!-- @include partials/head.html -->
```

Paths are relative to **`src/`**.
