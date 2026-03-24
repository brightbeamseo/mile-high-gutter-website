/**
 * Helpers for Sanity payloads (strings, optional legacy `{ value }` on array items, templates).
 * Homepage required fields are validated in assert-sanity-homepage.js before render.
 */

export function asStr(x) {
  if (x == null) return ''
  if (typeof x === 'string') return x
  if (typeof x === 'object' && x !== null && 'value' in x) {
    return String(/** @type {{ value?: unknown }} */ (x).value ?? '')
  }
  return String(x)
}

export function asStrArray(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((x) => asStr(x))
}

/**
 * Replace `{{key}}` placeholders (non-HTML — escape output if embedding in HTML).
 * @param {string | null | undefined} template
 * @param {Record<string, string | number | undefined | null>} vars
 */
export function applyTemplate(template, vars) {
  if (template == null) return ''
  let out = String(template)
  for (const [k, v] of Object.entries(vars)) {
    const re = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g')
    out = out.replace(re, v != null && v !== '' ? String(v) : '')
  }
  return out
}

export function mediaUrl(relPath) {
  if (relPath == null || relPath === '') return ''
  return '/' + String(relPath).split('/').map(encodeURIComponent).join('/')
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function statLookup(statsValues, key) {
  if (!statsValues || key == null) return ''
  return asStr(statsValues[key])
}
