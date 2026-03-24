# Schemas (from `shared/homepage-content.json`)

Field names and nested shapes follow the JSON. No extra keys were added.

## `siteSettings` (document)

Global business / site data — these **top-level** keys from the JSON:

| Field | JSON shape |
|-------|------------|
| `business` | object |
| `businessCategories` | array of **`stringListItem`** (`{ value: string }`) — not plain `string[]` (avoids Studio validation errors on existing data) |
| `keywords` | same as `businessCategories` |
| `businessListings` | object |
| `meta` | object (`title`, `description`) |
| `theme` | object — `note`, `colors`, `fonts`, `shadows` (same keys as `shared/homepage-content.json` `theme`; drives CSS variables) |
| `statsValues` | object |
| `mapEmbedUrl` | string (long embed URL) |

## `homePage` (document)

Homepage sections — all **other** top-level keys from the same JSON (no duplication of `business`, `meta`, etc.):

`page`, `layoutBackgrounds`, `header`, `hero`, `brandsMarquee`, `projects`, `whyChoose`, `services`, `about`, `uniquePoints`, `statsBar`, `contactBanner`, `reviews`, `serviceArea`, `team`, `faq`, `footerEstimate`, `footerBrand`, `footerColumns`, `footerSupport`

Nested section objects (`hero`, `services`, `reviews`, `faq`, …) are defined in `objectTypes.ts`.

## Merging for the static build / frontend

At query or build time, merge `siteSettings` and `homePage` into one object matching the original JSON shape (e.g. `{ ...siteSettings, ...homePage }` with `mapEmbedUrl` once from `siteSettings`).

## Singletons

The Studio sidebar is configured in **`sanity.config.ts`** so you edit **one** document each:

| Type | Document `_id` | Notes |
|------|----------------|--------|
| `siteSettings` | **`siteSettingsSingleton`** | Canonical global settings; `scripts/import-content.js` writes here. |
| `homePage` | **`homePageSingleton`** | Canonical homepage sections; import script writes here. |

The **schema** still allows multiple `siteSettings` / `homePage` documents (Sanity default). If you ever see duplicates (e.g. an auto-generated `_id` like `siteSettings-…`), copy any missing fields into the singleton above, then **delete** the extra document in Vision or the default document list (or merge in Studio then remove the orphan). The Astro site prefers **`siteSettingsSingleton`** for site-wide header/offer bar when multiple `siteSettings` exist.
