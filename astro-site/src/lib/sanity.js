import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'vvvqtudm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  // Must be false: API CDN is eventually consistent and caches reads — offer bar / nav
  // edits in Studio can look "stuck" on old copy (e.g. 10% vs 20%) until cache expires.
  useCdn: false,
})