import {defineField, defineType} from 'sanity'

/**
 * Long-form articles at root URLs (e.g. /gutter-repair-cost-in-denver-co/).
 * Same content blocks as city pages, without FAQ / services grid / reviews / map.
 */
export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'meta',
      title: 'SEO',
      type: 'meta',
      description: 'Browser title & meta description for search results.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'eyebrow', type: 'string', title: 'Hero eyebrow'}),
    defineField({name: 'headline', type: 'string', title: 'Hero headline', validation: (rule) => rule.required()}),
    defineField({name: 'category', type: 'string', title: 'Category'}),
    defineField({name: 'tldr', type: 'text', rows: 2, title: 'TLDR summary'}),
    defineField({name: 'lead', type: 'text', rows: 4, title: 'Hero lead paragraph'}),
    defineField({
      name: 'layoutBackgrounds',
      type: 'layoutBackgrounds',
      title: 'Background images',
      description: 'Optional hero background (same as other pages).',
    }),
    defineField({
      name: 'contentSections',
      title: 'Article content',
      type: 'array',
      of: [{type: 'cityContentSection'}],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'headline', slug: 'slug.current', date: 'publishedAt'},
    prepare({title, slug, date}) {
      const d = date ? new Date(date).toLocaleDateString() : ''
      return {
        title: title || 'Blog post',
        subtitle: [slug ? `/${slug}/` : '', d].filter(Boolean).join(' · '),
      }
    },
  },
  orderings: [
    {
      title: 'Published (newest)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
})
