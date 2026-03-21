# Schemas (from `shared/homepage-content.json`)

Field names and nested shapes follow the JSON. No extra keys were added.

## `siteSettings` (document)

Global business / site data — these **top-level** keys from the JSON:

| Field | JSON shape |
|-------|------------|
| `business` | object |
| `businessCategories` | array of strings |
| `keywords` | array of strings |
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

Use one `siteSettings` document and one `homePage` document (e.g. fixed IDs in Structure Builder).
