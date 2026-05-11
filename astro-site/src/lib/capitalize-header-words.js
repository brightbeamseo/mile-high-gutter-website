/**
 * Title-style caps for LP headers: each word gets a leading letter uppercase,
 * remainder lowercase. Preserves non-letter prefixes (e.g. #1) when no letter is present.
 * @param {string} text
 */
export function capitalizeHeaderWords(text) {
  return String(text)
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return word
      const match = word.match(/^([^a-zA-Z]*)([a-zA-Z])(.*)$/)
      if (!match) return word
      const [, prefix, first, rest] = match
      return prefix + first.toUpperCase() + rest.toLowerCase()
    })
    .join(' ')
}
