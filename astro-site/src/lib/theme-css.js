/**
 * Build :root { ... } CSS from Sanity siteSettings.theme only (no default palette).
 * Base tokens still come from styles.css; only keys present in Sanity override.
 */

const THEME_COLOR_VARS = {
  background: '--color-bg',
  backgroundAlt: '--color-bg-alt',
  surface: '--color-surface',
  text: '--color-text',
  textMuted: '--color-text-muted',
  accent: '--color-accent',
  accentHover: '--color-accent-hover',
  primary: '--color-dark',
  border: '--color-border',
}

const THEME_FONT_VARS = {
  heading: '--font-heading',
  body: '--font-body',
}

const THEME_SHADOW_VARS = {
  default: '--shadow',
  large: '--shadow-lg',
}

function sanitizeCssToken(value) {
  return String(value).replace(/</g, '').replace(/>/g, '').trim()
}

/**
 * @param {Record<string, unknown> | null | undefined} raw
 * @returns {string}
 */
export function buildThemeCss(raw) {
  if (!raw || typeof raw !== 'object') {
    return ':root {\n}'
  }

  const theme = /** @type {Record<string, unknown>} */ (raw)
  const colors =
    theme.colors && typeof theme.colors === 'object'
      ? /** @type {Record<string, unknown>} */ (theme.colors)
      : {}
  const fonts =
    theme.fonts && typeof theme.fonts === 'object'
      ? /** @type {Record<string, unknown>} */ (theme.fonts)
      : {}
  const shadows =
    theme.shadows && typeof theme.shadows === 'object'
      ? /** @type {Record<string, unknown>} */ (theme.shadows)
      : {}

  const lines = [':root {']

  for (const [jsonKey, cssVar] of Object.entries(THEME_COLOR_VARS)) {
    const v = colors[jsonKey]
    if (v != null && String(v).trim() !== '') {
      lines.push(`  ${cssVar}: ${sanitizeCssToken(v)};`)
    }
  }
  for (const [jsonKey, cssVar] of Object.entries(THEME_FONT_VARS)) {
    const v = fonts[jsonKey]
    if (v != null && String(v).trim() !== '') {
      lines.push(`  ${cssVar}: ${sanitizeCssToken(v)};`)
    }
  }
  for (const [jsonKey, cssVar] of Object.entries(THEME_SHADOW_VARS)) {
    const v = shadows[jsonKey]
    if (v != null && String(v).trim() !== '') {
      lines.push(`  ${cssVar}: ${sanitizeCssToken(v)};`)
    }
  }

  lines.push('}')
  return lines.join('\n')
}
