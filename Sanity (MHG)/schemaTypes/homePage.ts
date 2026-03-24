/**
 * Homepage content — remaining top-level keys from shared/homepage-content.json
 * (sections only; global business lives on siteSettings).
 */
import {defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'page',
      type: 'string',
      title: 'page',
      initialValue: 'home',
    }),
    defineField({name: 'layoutBackgrounds', type: 'layoutBackgrounds'}),
    defineField({name: 'header', type: 'header'}),
    defineField({name: 'hero', type: 'hero'}),
    defineField({name: 'brandsMarquee', type: 'brandsMarquee'}),
    defineField({name: 'projects', type: 'projects'}),
    defineField({name: 'whyChoose', type: 'whyChoose'}),
    defineField({name: 'services', type: 'services'}),
    defineField({name: 'about', type: 'about'}),
    defineField({name: 'uniquePoints', type: 'uniquePoints'}),
    defineField({name: 'statsBar', type: 'statsBar'}),
    defineField({name: 'contactBanner', type: 'contactBanner'}),
    defineField({name: 'reviews', type: 'reviews'}),
    defineField({name: 'serviceArea', type: 'serviceArea'}),
    defineField({name: 'team', type: 'team'}),
    defineField({name: 'faq', type: 'faq'}),
    defineField({name: 'footerEstimate', type: 'footerEstimate'}),
    defineField({name: 'footerBrand', type: 'footerBrand'}),
    defineField({
      name: 'footerColumns',
      type: 'array',
      of: [{type: 'footerColumn'}],
    }),
    defineField({name: 'footerSupport', type: 'footerSupport'}),
  ],
})
