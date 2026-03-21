# Homepage sections

Section markup is **generated at build time** from:

- `shared/homepage-content.json` (copy & structured data)
- `scripts/homepage_render.py` (HTML structure, classes, icons)

Edit **`src/index.html`** to change section **order** or which blocks appear (`<!-- @homepage:… -->` markers).

Do not expect `.html` files here to be included by the build—the previous per-section includes were removed in favor of JSON-driven rendering.
