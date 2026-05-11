import { capitalizeHeaderWords } from './capitalize-header-words.js'

/**
 * Keyword-focused FAQ entries for /lp/* landing pages (shared across routes).
 * @param {string} lpKeyword
 */
export function buildLpFaqItems(lpKeyword) {
  const q = (s) => capitalizeHeaderWords(s)

  return [
    {
      question: q(`Why might I need ${lpKeyword}?`),
      answerHtml: `<p>Denver weather, wind, and debris stress roof drainage. If you are seeing overflow, separation, rust, or damage after storms, it may be time to address ${lpKeyword}. We help you understand whether repair or replacement is the better fit.</p>`,
    },
    {
      question: q(`How is pricing handled for ${lpKeyword}?`),
      answerHtml: `<p>We visit your property, review the scope, and provide a written estimate—no surprises. Your quote reflects materials, labor, and access so you can compare options for ${lpKeyword} with confidence.</p>`,
    },
    {
      question: q(`What timeline should I expect for ${lpKeyword}?`),
      answerHtml: `<p>Many projects wrap up in a single day; larger homes or complex rooflines can take longer. Your estimator will spell out the schedule before we begin ${lpKeyword} on your property.</p>`,
    },
    {
      question: q(`Do you offer warranties on ${lpKeyword}?`),
      answerHtml: `<p>We combine careful workmanship with manufacturer-backed materials where applicable. Coverage depends on the scope—your estimator will review warranty terms tied to your ${lpKeyword} project.</p>`,
    },
    {
      question: q(`Why choose Mile High Gutter for ${lpKeyword}?`),
      answerHtml: `<p>Locally owned, decades serving the metro, and crews trained on seamless systems built for Colorado snow, ice, and hail. We aim to make ${lpKeyword} straightforward from first call to cleanup.</p>`,
    },
  ]
}
