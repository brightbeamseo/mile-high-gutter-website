import {defineField, defineType} from 'sanity'

export const faqPage = defineType({
  name: 'faqPage',
  title: 'FAQ Page',
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
      name: 'faq',
      type: 'faq',
      title: 'FAQ Content',
      description: 'Questions and answers rendered in the accordion.',
    }),
  ],
})
