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
      title: 'Business categories',
      description: 'Each row is one line of text (stored as a small object so Studio stays valid).',
      of: [{type: 'stringListItem'}],
    }),
    defineField({
      name: 'keywords',
      type: 'array',
      title: 'Keywords',
      description: 'SEO-style keywords, one per row.',
      of: [{type: 'stringListItem'}],
    }),
    defineField({name: 'businessListings', type: 'businessListings'}),
    defineField({
      name: 'forms',
      type: 'siteForms',
      title: 'Forms',
      description: 'Lead form endpoint path (e.g. /api/lead).',
    }),
    defineField({name: 'meta', type: 'meta'}),
    defineField({
      name: 'theme',
      type: 'theme',
      title: 'Theme',
      description: 'Overrides :root CSS variables (same shape as shared/homepage-content.json theme).',
    }),
    defineField({name: 'statsValues', type: 'statsValues'}),
    defineField({
      name: 'reviews',
      type: 'reviews',
      title: 'Global Reviews',
      description: 'Review summary/testimonials shared across pages.',
    }),
    defineField({
      name: 'header',
      type: 'header',
      title: 'Global Header',
      description: 'Navigation and header CTAs used across all pages.',
    }),
    defineField({
      name: 'footerEstimate',
      type: 'footerEstimate',
      title: 'Global Footer Estimate',
      description: 'Top contact/estimate footer section shared across pages.',
    }),
    defineField({
      name: 'footerBrand',
      type: 'footerBrand',
      title: 'Global Footer Brand',
      description: 'Footer brand block and social links shared across pages.',
    }),
    defineField({
      name: 'footerColumns',
      type: 'array',
      title: 'Global Footer Columns',
      of: [{type: 'footerColumn'}],
    }),
    defineField({
      name: 'footerSupport',
      type: 'footerSupport',
      title: 'Global Footer Support',
      description: 'Bottom legal/support links shared across pages.',
    }),
    defineField({
      name: 'mapEmbedUrl',
      type: 'text',
      title: 'mapEmbedUrl',
      rows: 2,
    }),
    defineField({
      name: 'productsServicesIntro',
      type: 'text',
      title: 'Products & Services intro',
      rows: 3,
      description: 'Optional short intro shown below the Products & Services page heading.',
    }),
    defineField({
      name: 'blogAuthorBio',
      type: 'text',
      title: 'Blog author bio',
      rows: 5,
      description:
        'Shown at the end of every blog post with your logo (company as author). Plain text.',
    }),
  ],
})
