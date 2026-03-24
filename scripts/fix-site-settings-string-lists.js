/**
 * One-time migration: normalize `businessCategories` and `keywords` on every `siteSettings`
 * document to `{ _type: 'stringListItem', value, _key }` so Studio validates after schema change.
 *
 * Run from repo root (requires SANITY_* env — same as import:content):
 *   node scripts/fix-site-settings-string-lists.js
 */
import 'dotenv/config';
import { nanoid } from 'nanoid';
import { getSanityWriteClient } from '../lib/sanity-write.js';

const STRING_LIST_TYPE = 'stringListItem';

function normalizeListItem(item) {
  if (typeof item === 'string') {
    return {
      _key: nanoid(12),
      _type: STRING_LIST_TYPE,
      value: item,
    };
  }
  if (item && typeof item === 'object') {
    const raw =
      item.value != null
        ? String(item.value)
        : item.label != null
          ? String(item.label)
          : '';
    return {
      _key: typeof item._key === 'string' && item._key ? item._key : nanoid(12),
      _type: STRING_LIST_TYPE,
      value: raw,
    };
  }
  return {
    _key: nanoid(12),
    _type: STRING_LIST_TYPE,
    value: String(item ?? ''),
  };
}

function normalizeList(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeListItem);
}

async function main() {
  const client = getSanityWriteClient();
  const rows = await client.fetch(`*[_type == "siteSettings"]{_id}`);
  const ids = Array.isArray(rows) ? rows.map((r) => r._id).filter(Boolean) : [];
  if (ids.length === 0) {
    console.log('No siteSettings documents found.');
    return;
  }

  for (const id of ids) {
    const doc = await client.fetch(`*[_id == $id][0]{ businessCategories, keywords }`, { id });
    if (!doc) continue;

    const businessCategories = normalizeList(doc.businessCategories);
    const keywords = normalizeList(doc.keywords);

    await client
      .patch(id)
      .set({ businessCategories, keywords })
      .commit();

    console.log('Patched', id, {
      businessCategories: businessCategories.length,
      keywords: keywords.length,
    });
  }

  console.log('Done. Redeploy Studio schema if needed, then refresh Studio and publish.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
