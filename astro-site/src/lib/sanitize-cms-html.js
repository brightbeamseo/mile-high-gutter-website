/**
 * Sanitize HTML from Sanity so editors can use links and basic formatting (SEO)
 * without allowing script, iframes, or event handlers (XSS mitigation).
 */
import sanitizeHtml from 'sanitize-html'

const OPTIONS = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'h2',
    'h3',
    'h4',
    'blockquote',
    'span',
    'div',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'title', 'rel'],
    span: ['id', 'class'],
    div: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || ''
      const external = /^https?:\/\//i.test(href)
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          ...(external
            ? {
                target: attribs.target || '_blank',
                rel: 'noopener noreferrer',
              }
            : {}),
        },
      }
    },
  },
}

/**
 * @param {unknown} html
 * @returns {string}
 */
export function sanitizeCmsHtml(html) {
  const s = String(html ?? '').trim()
  if (!s) return ''
  return sanitizeHtml(s, OPTIONS)
}
