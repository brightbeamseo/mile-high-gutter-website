/**
 * Add `_key` only to **object** array items (for Sanity arrays of objects).
 * Primitive items in arrays stay unchanged — e.g. `of: [{ type: 'string' }]` →
 * `["gutter repair", "gutter installation"]` with no `{ _key, value }` wrapping.
 */
import { nanoid } from 'nanoid';

function transform(node) {
  if (node === null || typeof node !== 'object') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((item) => {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        const obj = { ...item, _key: nanoid(12) };
        for (const k of Object.keys(obj)) {
          if (k === '_key') continue;
          obj[k] = transform(obj[k]);
        }
        return obj;
      }
      if (Array.isArray(item)) {
        return transform(item);
      }
      // Primitives (string / number / boolean): keep as-is for string[] etc.
      return item;
    });
  }

  const out = { ...node };
  for (const k of Object.keys(out)) {
    out[k] = transform(out[k]);
  }
  return out;
}

/**
 * Deep clone via JSON and add `_key` to object array entries only (nested).
 * @param {unknown} value
 * @returns {unknown}
 */
export function addKeysToSanityArrays(value) {
  return transform(JSON.parse(JSON.stringify(value)));
}
