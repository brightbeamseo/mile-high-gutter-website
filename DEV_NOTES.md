# Site-wide footer & estimates

- **Main estimate form** lives in the footer: `<section id="contact" class="section contact footer-estimate">…</section>`.
- **All “schedule / free estimate / request estimate” CTAs** should use `href="#contact"` so they scroll to that form on any page.
- When you add new HTML pages, **copy the same `<footer>…</footer>` and `footer-support` block** from `index.html` so `#contact` always exists.

---

# Homepage modular build

## Project layout

| Path | Purpose |
|------|---------|
| **`src/index.html`** | Main assembly file for the homepage—readable **top to bottom** (includes only). |
| **`src/sections/`** | One **`.html` file per homepage section** (hero, services, FAQ, footer, etc.). |
| **`src/partials/head.html`** | `<head>` content: meta, fonts, **`styles.css`**. |
| **`shared/site.json`** | Shared business data: phone, email, address, review stats, logo paths, map URL, etc. |
| **`scripts/build-html.py`** | Merges includes + `{{placeholders}}` → **`index.html`** at project root. |
| **`index.html`** (root) | **Deployable** file—what you upload or open in the browser. |

## How to edit

1. Change **section markup** in `src/sections/<section>.html` (or add a new section file and a matching `<!-- @include ... -->` line in `src/index.html`).
2. Change **site-wide text** (phone, email, stats, logos) in **`shared/site.json`**, then use **`{{key}}`** in HTML where the key matches JSON (e.g. `{{phoneDisplay}}`).
3. Change **head/meta/styles** in **`src/partials/head.html`**.
4. Rebuild (below) so the root **`index.html`** stays in sync.

**Include syntax** (paths are always relative to **`src/`**):

```html
<!-- @include sections/hero.html -->
```

## How to rebuild

After any change under `src/` or `shared/site.json`:

```bash
python3 scripts/build-html.py
```

Or:

```bash
npm run build
```

Optional: auto-rebuild while editing:

```bash
npm run watch
```

**Preview/deploy the generated `index.html` at the project root** (not `src/index.html` alone).
