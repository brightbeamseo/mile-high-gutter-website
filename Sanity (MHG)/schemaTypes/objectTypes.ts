/**
 * Nested object types — field names match shared/homepage-content.json (sections + shared objects).
 */
import { defineField, defineType } from 'sanity'

export const layoutBackgroundSection = defineType({
  name: 'layoutBackgroundSection',
  title: 'Layout background section',
  type: 'object',
  fields: [
    defineField({ name: 'imageSrc', type: 'string', title: 'Image path (imageSrc)' }),
    defineField({ name: 'location', type: 'string', title: 'Location' }),
  ],
})

export const layoutBackgrounds = defineType({
  name: 'layoutBackgrounds',
  title: 'Layout backgrounds',
  type: 'object',
  fields: [
    defineField({
      name: 'note',
      type: 'text',
      title: 'note',
      rows: 2,
    }),
    defineField({ name: 'hero', type: 'layoutBackgroundSection' }),
    defineField({ name: 'uniquePoints', type: 'layoutBackgroundSection' }),
    defineField({ name: 'services', type: 'layoutBackgroundSection' }),
  ],
})

export const meta = defineType({
  name: 'meta',
  title: 'Meta',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'title' }),
    defineField({ name: 'description', type: 'text', title: 'description', rows: 3 }),
  ],
})

/** Keys match shared/homepage-content.json `theme` — injected as :root CSS vars after styles.css */
export const themeColors = defineType({
  name: 'themeColors',
  title: 'Theme colors',
  type: 'object',
  fields: [
    defineField({ name: 'background', type: 'string', title: 'background → --color-bg' }),
    defineField({ name: 'backgroundAlt', type: 'string', title: 'backgroundAlt → --color-bg-alt' }),
    defineField({ name: 'surface', type: 'string', title: 'surface → --color-surface' }),
    defineField({ name: 'text', type: 'string', title: 'text → --color-text' }),
    defineField({ name: 'textMuted', type: 'string', title: 'textMuted → --color-text-muted' }),
    defineField({ name: 'accent', type: 'string', title: 'accent → --color-accent' }),
    defineField({ name: 'accentHover', type: 'string', title: 'accentHover → --color-accent-hover' }),
    defineField({ name: 'primary', type: 'string', title: 'primary (brand dark) → --color-dark' }),
    defineField({ name: 'border', type: 'string', title: 'border → --color-border' }),
  ],
})

export const themeFonts = defineType({
  name: 'themeFonts',
  title: 'Theme fonts',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'heading stack → --font-heading',
      description: 'e.g. "Poppins", system-ui, sans-serif',
    }),
    defineField({
      name: 'body',
      type: 'string',
      title: 'body stack → --font-body',
      description: 'e.g. "Merriweather", Georgia, serif',
    }),
  ],
})

export const themeShadows = defineType({
  name: 'themeShadows',
  title: 'Theme shadows',
  type: 'object',
  fields: [
    defineField({ name: 'default', type: 'string', title: 'default → --shadow' }),
    defineField({ name: 'large', type: 'string', title: 'large → --shadow-lg' }),
  ],
})

export const theme = defineType({
  name: 'theme',
  title: 'Theme (CSS variables)',
  type: 'object',
  fields: [
    defineField({
      name: 'note',
      type: 'text',
      title: 'note',
      rows: 2,
    }),
    defineField({ name: 'colors', type: 'themeColors' }),
    defineField({ name: 'fonts', type: 'themeFonts' }),
    defineField({ name: 'shadows', type: 'themeShadows' }),
  ],
})

export const business = defineType({
  name: 'business',
  title: 'Business',
  type: 'object',
  fields: [
    defineField({ name: 'companyName', type: 'string' }),
    defineField({ name: 'companyNameShort', type: 'string' }),
    defineField({ name: 'phoneDisplay', type: 'string' }),
    defineField({ name: 'phoneTel', type: 'string' }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'websiteUrl', type: 'string' }),
    defineField({ name: 'addressShort', type: 'string' }),
    defineField({ name: 'addressMetro', type: 'string' }),
    defineField({ name: 'copyrightSiteUrl', type: 'string' }),
    defineField({ name: 'descriptionShort', type: 'text', rows: 3 }),
    defineField({ name: 'descriptionLong', type: 'text', rows: 5 }),
    defineField({ name: 'hoursText', type: 'string' }),
    defineField({ name: 'dateOpened', type: 'string' }),
    defineField({ name: 'logoHorizontalBlack', type: 'string', title: 'logoHorizontalBlack (path)' }),
    defineField({ name: 'logoHorizontalBlackLocation', type: 'string' }),
    defineField({ name: 'logoHorizontalWhite', type: 'string', title: 'logoHorizontalWhite (path)' }),
    defineField({ name: 'logoHorizontalWhiteLocation', type: 'string' }),
  ],
})

export const businessListings = defineType({
  name: 'businessListings',
  title: 'Business listings',
  type: 'object',
  fields: [
    defineField({
      name: 'googleMaps',
      type: 'string',
      title: 'Google Maps / Business Profile URL',
      description: 'Used for the footer & estimate address link (opens in a new tab).',
    }),
    defineField({ name: 'bingPlaces', type: 'string' }),
    defineField({ name: 'facebook', type: 'string' }),
    defineField({ name: 'instagram', type: 'string' }),
    defineField({ name: 'twitter', type: 'string' }),
    defineField({ name: 'linkedin', type: 'string' }),
    defineField({ name: 'yelp', type: 'string' }),
  ],
})

/** Lead form POST path (e.g. /api/lead) — used by Astro head + script.js */
export const siteForms = defineType({
  name: 'siteForms',
  title: 'Forms',
  type: 'object',
  fields: [
    defineField({ name: 'submitPath', type: 'string', title: 'Lead POST path' }),
    defineField({ name: 'formKicker', type: 'string', title: 'Universal form kicker' }),
    defineField({ name: 'formAriaLabel', type: 'string', title: 'Universal form aria-label' }),
    defineField({
      name: 'requiredIndicator',
      type: 'string',
      title: 'Required indicator',
      description: 'Symbol shown for required fields (example: *).',
    }),
  ],
})

export const offerBar = defineType({
  name: 'offerBar',
  title: 'Offer bar',
  type: 'object',
  fields: [
    defineField({ name: 'textBeforeDiscount', type: 'string' }),
    defineField({ name: 'discountLabel', type: 'string' }),
    defineField({ name: 'textAfterDiscount', type: 'string' }),
    defineField({ name: 'ctaText', type: 'string' }),
    defineField({ name: 'ctaHref', type: 'string' }),
  ],
})

/**
 * String in an array — use this instead of `of: [{ type: 'string' }]` for site settings lists.
 * Plain string arrays often end up as `{ value: "..." }` objects in the dataset, which then
 * fail validation ("Item of type object not valid for this list"). This object type matches that shape.
 */
export const stringListItem = defineType({
  name: 'stringListItem',
  title: 'Text',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      type: 'string',
      title: 'Text',
    }),
  ],
  preview: {
    select: { title: 'value' },
    prepare({ title }) {
      return { title: title || '(empty)' }
    },
  },
})

export const navLinkItem = defineType({
  name: 'navLinkItem',
  title: 'Nav link',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string' }),
    defineField({ name: 'href', type: 'string' }),
  ],
})

export const navItem = defineType({
  name: 'navItem',
  title: 'Nav item',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string' }),
    defineField({ name: 'href', type: 'string' }),
    defineField({ name: 'dropdown', type: 'array', of: [{ type: 'navLinkItem' }] }),
  ],
})

export const header = defineType({
  name: 'header',
  title: 'Header',
  type: 'object',
  fields: [
    defineField({ name: 'offerBar', type: 'offerBar' }),
    defineField({ name: 'navItems', type: 'array', of: [{ type: 'navItem' }] }),
    defineField({ name: 'callCtaTemplate', type: 'string' }),
    defineField({ name: 'logoAriaLabelTemplate', type: 'string' }),
  ],
})

export const heroFormFields = defineType({
  name: 'heroFormFields',
  title: 'Hero form fields',
  type: 'object',
  fields: [
    defineField({ name: 'nameLabel', type: 'string' }),
    defineField({ name: 'emailLabel', type: 'string' }),
    defineField({ name: 'phoneLabel', type: 'string' }),
    defineField({ name: 'cityLabel', type: 'string' }),
    defineField({ name: 'projectDetailsLabel', type: 'string' }),
    defineField({ name: 'requiredIndicator', type: 'string' }),
  ],
})

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'lead', type: 'text', rows: 3 }),
    defineField({ name: 'callCtaTemplate', type: 'string' }),
    defineField({ name: 'formAriaLabel', type: 'string' }),
    defineField({ name: 'formKicker', type: 'string' }),
    defineField({ name: 'formHeadline', type: 'string' }),
    defineField({ name: 'formSub', type: 'text', rows: 2 }),
    defineField({ name: 'formFields', type: 'heroFormFields' }),
    defineField({ name: 'formSubmitCta', type: 'string' }),
    defineField({ name: 'formSubmitHref', type: 'string' }),
    defineField({ name: 'typedPhrases', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'typedFallbackPhrase', type: 'string' }),
  ],
})

export const brandsMarquee = defineType({
  name: 'brandsMarquee',
  title: 'Brands marquee',
  type: 'object',
  fields: [
    defineField({ name: 'ariaLabel', type: 'string' }),
    defineField({ name: 'brands', type: 'array', of: [{ type: 'string' }] }),
  ],
})

export const projectSlide = defineType({
  name: 'projectSlide',
  title: 'Project slide',
  type: 'object',
  fields: [
    defineField({ name: 'imageSrc', type: 'string' }),
    defineField({ name: 'imageAlt', type: 'string' }),
    defineField({ name: 'location', type: 'string' }),
  ],
})

export const projects = defineType({
  name: 'projects',
  title: 'Projects',
  type: 'object',
  fields: [
    defineField({ name: 'sectionAriaLabel', type: 'string' }),
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'slides', type: 'array', of: [{ type: 'projectSlide' }] }),
    defineField({ name: 'controlsAriaLabel', type: 'string' }),
    defineField({ name: 'prevAriaLabel', type: 'string' }),
    defineField({ name: 'nextAriaLabel', type: 'string' }),
    defineField({ name: 'prevLabel', type: 'string' }),
    defineField({ name: 'nextLabel', type: 'string' }),
  ],
})

export const whyChooseBullet = defineType({
  name: 'whyChooseBullet',
  title: 'Why choose bullet',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'text', type: 'text', rows: 2 }),
  ],
})

export const whyChooseStamp = defineType({
  name: 'whyChooseStamp',
  title: 'Why choose stamp',
  type: 'object',
  fields: [
    defineField({ name: 'homesCountTemplate', type: 'string' }),
    defineField({ name: 'homesCountKey', type: 'string' }),
    defineField({ name: 'line2', type: 'string' }),
    defineField({ name: 'line3', type: 'string' }),
  ],
})

export const whyChooseCtas = defineType({
  name: 'whyChooseCtas',
  title: 'Why choose CTAs',
  type: 'object',
  fields: [
    defineField({ name: 'callTemplate', type: 'string' }),
    defineField({ name: 'estimate', type: 'string' }),
    defineField({ name: 'estimateHref', type: 'string' }),
  ],
})

export const whyChoose = defineType({
  name: 'whyChoose',
  title: 'Why choose',
  type: 'object',
  fields: [
    defineField({ name: 'imageSrc', type: 'string' }),
    defineField({ name: 'imageAlt', type: 'string' }),
    defineField({ name: 'location', type: 'string' }),
    defineField({ name: 'stamp', type: 'whyChooseStamp' }),
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'lead', type: 'text', rows: 3 }),
    defineField({ name: 'bullets', type: 'array', of: [{ type: 'whyChooseBullet' }] }),
    defineField({ name: 'note', type: 'text', rows: 2 }),
    defineField({ name: 'ctas', type: 'whyChooseCtas' }),
  ],
})

export const serviceItem = defineType({
  name: 'serviceItem',
  title: 'Service item',
  type: 'object',
  fields: [
    defineField({ name: 'number', type: 'string' }),
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({
      name: 'href',
      title: 'Service Page Link',
      type: 'string',
      description: 'Optional. If empty, the site auto-generates a /products-services/.../ link from the title.',
    }),
  ],
})

export const services = defineType({
  name: 'services',
  title: 'Services',
  type: 'object',
  fields: [
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'items', type: 'array', of: [{ type: 'serviceItem' }] }),
  ],
})

export const aboutVideo = defineType({
  name: 'aboutVideo',
  title: 'About video',
  type: 'object',
  fields: [
    defineField({ name: 'posterSrc', type: 'string' }),
    defineField({ name: 'posterLocation', type: 'string' }),
    defineField({ name: 'sourceSrc', type: 'string' }),
    defineField({ name: 'sourceType', type: 'string' }),
  ],
})

export const aboutCtas = defineType({
  name: 'aboutCtas',
  title: 'About CTAs',
  type: 'object',
  fields: [
    defineField({ name: 'callTemplate', type: 'string' }),
    defineField({ name: 'estimate', type: 'string' }),
    defineField({ name: 'estimateHref', type: 'string' }),
  ],
})

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'lead', type: 'text', rows: 3 }),
    defineField({ name: 'bullets', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'video', type: 'aboutVideo' }),
    defineField({ name: 'badgesAriaLabel', type: 'string' }),
    defineField({ name: 'badges', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'ctas', type: 'aboutCtas' }),
  ],
})

export const uniquePointItem = defineType({
  name: 'uniquePointItem',
  title: 'Unique point item',
  type: 'object',
  fields: [
    defineField({ name: 'iconId', type: 'string' }),
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'description', type: 'text', rows: 2 }),
  ],
})

export const uniquePoints = defineType({
  name: 'uniquePoints',
  title: 'Unique points',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'items', type: 'array', of: [{ type: 'uniquePointItem' }] }),
  ],
})

export const statsBarItem = defineType({
  name: 'statsBarItem',
  title: 'Stats bar item',
  type: 'object',
  fields: [
    defineField({ name: 'valueKey', type: 'string' }),
    defineField({ name: 'label', type: 'string' }),
  ],
})

export const statsBar = defineType({
  name: 'statsBar',
  title: 'Stats bar',
  type: 'object',
  fields: [
    defineField({ name: 'ariaLabel', type: 'string' }),
    defineField({ name: 'items', type: 'array', of: [{ type: 'statsBarItem' }] }),
  ],
})

export const statsValues = defineType({
  name: 'statsValues',
  title: 'Stats values',
  type: 'object',
  fields: [
    defineField({ name: 'statsYearsExperience', type: 'string' }),
    defineField({ name: 'statsJobsCompleted', type: 'string' }),
    defineField({ name: 'statsAvgRating', type: 'string' }),
    defineField({ name: 'statsResponseTime', type: 'string' }),
    defineField({ name: 'whyChooseHomesCount', type: 'string' }),
  ],
})

export const contactBanner = defineType({
  name: 'contactBanner',
  title: 'Contact banner',
  type: 'object',
  fields: [
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'paragraph1', type: 'text', rows: 2 }),
    defineField({ name: 'paragraph2', type: 'string' }),
    defineField({ name: 'phoneIconSrc', type: 'string' }),
    defineField({ name: 'phoneIconLocation', type: 'string' }),
  ],
})

export const reviewsSummary = defineType({
  name: 'reviewsSummary',
  title: 'Reviews summary',
  type: 'object',
  fields: [
    defineField({ name: 'brandLabel', type: 'string' }),
    defineField({ name: 'googleIconSrc', type: 'string' }),
    defineField({ name: 'googleIconLocation', type: 'string' }),
    defineField({ name: 'ratingValueKey', type: 'string' }),
    defineField({ name: 'starsImageSrc', type: 'string' }),
    defineField({ name: 'starsImageLocation', type: 'string' }),
    defineField({ name: 'starsImageAlt', type: 'string' }),
    defineField({ name: 'reviewCountKey', type: 'string' }),
    defineField({ name: 'reviewCountPrefix', type: 'string' }),
    defineField({ name: 'reviewCountSuffix', type: 'string' }),
    defineField({ name: 'ctaText', type: 'string' }),
    defineField({ name: 'ctaHref', type: 'string' }),
  ],
})

export const reviewValues = defineType({
  name: 'reviewValues',
  title: 'Review values',
  type: 'object',
  fields: [
    defineField({ name: 'reviewsRating', type: 'string' }),
    defineField({ name: 'reviewsCount', type: 'string' }),
  ],
})

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'object',
  fields: [
    defineField({ name: 'author', type: 'string' }),
    defineField({ name: 'timeAgo', type: 'string' }),
    defineField({ name: 'avatarSrc', type: 'string' }),
    defineField({ name: 'avatarLocation', type: 'string' }),
    defineField({ name: 'quote', type: 'text', rows: 4 }),
  ],
})

export const reviews = defineType({
  name: 'reviews',
  title: 'Reviews',
  type: 'object',
  fields: [
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'summary', type: 'reviewsSummary' }),
    defineField({ name: 'reviewValues', type: 'reviewValues' }),
    defineField({ name: 'postedOnLabel', type: 'string' }),
    defineField({ name: 'testimonials', type: 'array', of: [{ type: 'testimonial' }] }),
  ],
})

export const cityLink = defineType({
  name: 'cityLink',
  title: 'City link',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'href', type: 'string' }),
  ],
})

export const serviceArea = defineType({
  name: 'serviceArea',
  title: 'Service area',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 3 }),
    defineField({ name: 'mapEmbedUrlKey', type: 'string' }),
    defineField({ name: 'mapIframeTitleTemplate', type: 'string' }),
    defineField({ name: 'citiesLabel', type: 'string' }),
    defineField({ name: 'citiesNavAriaLabel', type: 'string' }),
    defineField({ name: 'cities', type: 'array', of: [{ type: 'cityLink' }] }),
  ],
})

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'object',
  fields: [
    defineField({ name: 'imageSrc', type: 'string' }),
    defineField({ name: 'imageAlt', type: 'string' }),
    defineField({ name: 'location', type: 'string' }),
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'bio', type: 'text', rows: 2 }),
  ],
})

export const team = defineType({
  name: 'team',
  title: 'Team',
  type: 'object',
  fields: [
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'members', type: 'array', of: [{ type: 'teamMember' }] }),
  ],
})

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ item',
  type: 'object',
  fields: [
    defineField({ name: 'question', type: 'string' }),
    defineField({
      name: 'answerHtml',
      type: 'text',
      rows: 6,
      description: 'HTML (e.g. <p>, <a href> for links). Sanitized when rendered.',
    }),
  ],
})

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'headingId', type: 'string' }),
    defineField({ name: 'items', type: 'array', of: [{ type: 'faqItem' }] }),
  ],
})

export const footerEstimateFormFields = defineType({
  name: 'footerEstimateFormFields',
  title: 'Footer estimate form fields',
  type: 'object',
  fields: [
    defineField({ name: 'nameLabel', type: 'string' }),
    defineField({ name: 'emailLabel', type: 'string' }),
    defineField({ name: 'phoneLabel', type: 'string' }),
    defineField({ name: 'cityLabel', type: 'string' }),
    defineField({ name: 'projectDetailsLabel', type: 'string' }),
    defineField({ name: 'submitButton', type: 'string' }),
  ],
})

export const footerEstimate = defineType({
  name: 'footerEstimate',
  title: 'Footer estimate',
  type: 'object',
  fields: [
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({ name: 'formFields', type: 'footerEstimateFormFields' }),
    defineField({ name: 'formAction', type: 'string' }),
    defineField({ name: 'formMethod', type: 'string' }),
  ],
})

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({ name: 'platform', type: 'string' }),
    defineField({ name: 'href', type: 'string' }),
    defineField({ name: 'ariaLabel', type: 'string' }),
  ],
})

export const footerBrand = defineType({
  name: 'footerBrand',
  title: 'Footer brand',
  type: 'object',
  fields: [
    defineField({ name: 'tagline', type: 'text', rows: 2 }),
    defineField({ name: 'socialAriaLabel', type: 'string' }),
    defineField({ name: 'socialLinks', type: 'array', of: [{ type: 'socialLink' }] }),
  ],
})

export const footerColumnLink = defineType({
  name: 'footerColumnLink',
  title: 'Footer column link',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string' }),
    defineField({ name: 'href', type: 'string' }),
  ],
})

export const footerColumn = defineType({
  name: 'footerColumn',
  title: 'Footer column',
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'string' }),
    defineField({ name: 'ariaLabel', type: 'string' }),
    defineField({ name: 'links', type: 'array', of: [{ type: 'footerColumnLink' }] }),
    defineField({ name: 'hoursHeading', type: 'string' }),
    defineField({ name: 'hoursText', type: 'string' }),
  ],
})

export const footerSupportLink = defineType({
  name: 'footerSupportLink',
  title: 'Footer support link',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string' }),
    defineField({ name: 'href', type: 'string' }),
    defineField({ name: 'target', type: 'string' }),
    defineField({ name: 'rel', type: 'string' }),
  ],
})

export const footerSupport = defineType({
  name: 'footerSupport',
  title: 'Footer support',
  type: 'object',
  fields: [
    defineField({ name: 'ariaLabel', type: 'string' }),
    defineField({ name: 'copyrightTemplate', type: 'string' }),
    defineField({ name: 'links', type: 'array', of: [{ type: 'footerSupportLink' }] }),
  ],
})

export const cityContentSection = defineType({
  name: 'cityContentSection',
  title: 'City content section',
  type: 'object',
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({
      name: 'body',
      type: 'text',
      rows: 8,
      description:
        'Body copy (blog posts + city service pages). HTML allowed for links and basic formatting. Example: <p>See <a href="/contact-us/">contact</a>.</p>',
    }),
    defineField({name: 'imageSrc', type: 'string'}),
    defineField({name: 'imageAlt', type: 'string'}),
  ],
})

/** All object types to register in schema (excluding documents siteSettings + homePage) */
export const homepageObjectTypes = [
  layoutBackgroundSection,
  layoutBackgrounds,
  meta,
  themeColors,
  themeFonts,
  themeShadows,
  theme,
  business,
  businessListings,
  siteForms,
  stringListItem,
  offerBar,
  navLinkItem,
  navItem,
  header,
  heroFormFields,
  hero,
  brandsMarquee,
  projectSlide,
  projects,
  whyChooseBullet,
  whyChooseStamp,
  whyChooseCtas,
  whyChoose,
  serviceItem,
  services,
  aboutVideo,
  aboutCtas,
  about,
  uniquePointItem,
  uniquePoints,
  statsBarItem,
  statsBar,
  statsValues,
  contactBanner,
  reviewsSummary,
  reviewValues,
  testimonial,
  reviews,
  cityLink,
  serviceArea,
  teamMember,
  team,
  faqItem,
  faq,
  footerEstimateFormFields,
  footerEstimate,
  socialLink,
  footerBrand,
  footerColumnLink,
  footerColumn,
  footerSupportLink,
  footerSupport,
  cityContentSection,
]
