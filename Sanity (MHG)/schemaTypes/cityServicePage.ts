import {defineField, defineType} from 'sanity'

export const cityServicePage = defineType({
  name: 'cityServicePage',
  title: 'City Service Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'headline', type: 'string'}),
    defineField({name: 'lead', type: 'text', rows: 3}),
    defineField({
      name: 'layoutBackgrounds',
      type: 'layoutBackgrounds',
      title: 'Background Images',
      description: 'Page-specific section backgrounds for this city page.',
    }),
    defineField({
      name: 'contentSections',
      title: 'Content Sections',
      type: 'array',
      of: [{type: 'cityContentSection'}],
      description:
        'Main page-specific content blocks. Image fields are optional per section.',
    }),
    defineField({
      name: 'reviews',
      type: 'reviews',
      title: 'Page Reviews',
      description: 'Page-specific review content for this city page.',
    }),
    defineField({
      name: 'faq',
      type: 'faq',
      title: 'Page FAQ',
    }),
    defineField({
      name: 'mapEmbedUrl',
      type: 'text',
      rows: 2,
      title: 'Map Embed URL',
      description: 'Optional page-specific map embed URL. Falls back to global site map.',
    }),
  ],
})
