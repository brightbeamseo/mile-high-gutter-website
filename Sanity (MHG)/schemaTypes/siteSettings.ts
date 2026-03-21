/**
 * Global business / site data — top-level keys from shared/homepage-content.json
 * that are not page sections: business, SEO meta, listings, stats values, map embed.
 */
import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({name: 'business', type: 'business'}),
    defineField({
      name: 'businessCategories',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'keywords',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({name: 'businessListings', type: 'businessListings'}),
    defineField({name: 'meta', type: 'meta'}),
    defineField({
      name: 'theme',
      type: 'theme',
      title: 'Theme',
      description: 'Overrides :root CSS variables (same shape as shared/homepage-content.json theme).',
    }),
    defineField({name: 'statsValues', type: 'statsValues'}),
    defineField({
      name: 'mapEmbedUrl',
      type: 'text',
      title: 'mapEmbedUrl',
      rows: 2,
    }),
  ],
})
