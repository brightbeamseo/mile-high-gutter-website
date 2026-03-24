import {defineField, defineType} from 'sanity'

export const reviewsPage = defineType({
  name: 'reviewsPage',
  title: 'Reviews Page',
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
      name: 'reviews',
      type: 'reviews',
      title: 'Reviews Content',
      description: 'Review summary and testimonial cards. Add more anytime.',
    }),
  ],
})
