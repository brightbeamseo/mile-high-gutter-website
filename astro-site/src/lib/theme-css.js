/**
 * Build :root { ... } CSS from theme object (Sanity siteSettings.theme or JSON).
 * Must stay in sync with scripts/homepage_render.py generate_theme_css.
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

const DEFAULT_THEME = {
  colors: {
    background: '#fafbfc',
    backgroundAlt: '#f2f4f8',
    surface: '#ffffff',
    text: '#384555',
    textMuted: '#5c6b7a',
    accent: '#527BBD',
    accentHover: '#4369a8',
    primary: '#143980',
    border: '#e2e6ee',
  },
  fonts: {
    heading: '"Poppins", system-ui, sans-serif',
    body: '"Merriweather", Georgia, serif',
  },
  shadows: {
    default: '0 4px 24px rgba(20, 57, 128, 0.06)',
    large: '0 16px 48px rgba(20, 57, 128, 0.1)',
  },
}

function sanitizeCssToken(value) {
  return String(value).replace(/</g, '').replace(/>/g, '').trim()
}

function mergeObjects(base, override) {
  return { ...base, ...(override && typeof override === 'object' ? override : {}) }
}

/**
 * @param {Record<string, unknown> | null | undefined} raw
 * @returns {string}
 */
export function buildThemeCss(raw) {
  const theme = raw && typeof raw === 'object' ? raw : {}
  const colors = mergeObjects(DEFAULT_THEME.colors, /** @type {any} */ (theme).colors)
  const fonts = mergeObjects(DEFAULT_THEME.fonts, /** @type {any} */ (theme).fonts)
  const shadows = mergeObjects(DEFAULT_THEME.shadows, /** @type {any} */ (theme).shadows)

  const lines = [':root {']

  for (const [jsonKey, cssVar] of Object.entries(THEME_COLOR_VARS)) {
    const v = colors[jsonKey]
    if (v) lines.push(`  ${cssVar}: ${sanitizeCssToken(v)};`)
  }
  for (const [jsonKey, cssVar] of Object.entries(THEME_FONT_VARS)) {
    const v = fonts[jsonKey]
    if (v) lines.push(`  ${cssVar}: ${sanitizeCssToken(v)};`)
  }
  for (const [jsonKey, cssVar] of Object.entries(THEME_SHADOW_VARS)) {
    const v = shadows[jsonKey]
    if (v) lines.push(`  ${cssVar}: ${sanitizeCssToken(v)};`)
  }

  lines.push('}')
  return lines.join('\n')
}
