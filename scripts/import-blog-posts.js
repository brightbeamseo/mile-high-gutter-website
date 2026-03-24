/**
 * Import blog posts from shared/blog-manifest.json + shared/blog/*.md into Sanity.
 *
 * Run from repo root: node scripts/import-blog-posts.js
 * Requires: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN (see .env.example)
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { addKeysToSanityArrays } from '../lib/sanity-array-keys.js';
import { upsertDocument } from '../lib/sanity-write.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST = join(ROOT, 'shared', 'blog-manifest.json');
const BLOG_DIR = join(ROOT, 'shared', 'blog');

/**
 * Split markdown on ## headings into cityContentSection-shaped objects.
 */
function markdownToSections(markdown) {
  const t = String(markdown || '').trim();
  if (!t) return [];
  const parts = t.split(/\n(?=## )/);
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split('\n');
      const first = lines[0] || '';
      if (first.startsWith('## ')) {
        return {
          heading: first.replace(/^##\s+/, '').trim(),
          body: lines.slice(1).join('\n').trim(),
        };
      }
      return { heading: 'Article', body: chunk };
    });
}

async function main() {
  const raw = readFileSync(MANIFEST, 'utf8');
  const entries = JSON.parse(raw);
  if (!Array.isArray(entries)) {
    throw new Error('blog-manifest.json must be an array');
  }

  for (const entry of entries) {
    const slug = entry.slug;
    const file = entry.markdownFile;
    if (!slug || !file) {
      console.warn('Skipping invalid manifest entry', entry);
      continue;
    }
    const mdPath = join(BLOG_DIR, file);
    const markdown = readFileSync(mdPath, 'utf8');
    const contentSections = addKeysToSanityArrays(markdownToSections(markdown));

    const data = {
      title: entry.headline || slug,
      slug: {current: slug},
      meta: entry.meta || {},
      publishedAt: entry.publishedAt,
      eyebrow: entry.eyebrow || 'Blog',
      headline: entry.headline || slug,
      lead: entry.lead || '',
      contentSections,
    };

    const doc = await upsertDocument(`blogPost-${slug}`, 'blogPost', data);
    console.log('Imported blogPost →', doc._id, slug);
  }

  console.log('Done. Set Site settings → Blog author bio in Studio if empty.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
