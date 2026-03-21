# Mile High Gutter — Astro site

- **`src/pages/index.astro`** — homepage content comes **only** from Sanity: **`*[_type == "siteSettings"][0]`** and **`*[_type == "homePage"][0]`** (no `shared/homepage-content.json`). **`assertSanityHomepage()`** in **`src/lib/assert-sanity-homepage.js`** throws during build if any required field is missing or empty (no silent fallbacks). **`siteSettings.forms.submitPath`** is required for the lead form (add `forms` in Studio, then **`node scripts/import-content.js`** from the repo root after deploying the schema).
- **Regenerate markup from static HTML (optional):** from repo root, `python3 scripts/gen-astro-index.py` (or `npm run gen:index` from `astro-site/`).
- **Styles:** `BaseLayout.astro` imports the repo-root `styles.css`. Theme overrides use **`siteSettings.theme`** only (no default palette merge). **Scripts:** `public/script.js`.
- **Images:** run `npm run sync:media` so `Media (MHG)/` exists under `public/` (matches `/Media%20(MHG)/…` URLs).

---

# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
