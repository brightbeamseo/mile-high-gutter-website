/**
 * Fail the Astro build if siteSettings / homePage are missing required fields.
 * No silent fallbacks — every section the template renders must be present in Sanity.
 */
import { asStr } from './sanity-strings.js'

const THEME_COLOR_KEYS = [
  'background',
  'backgroundAlt',
  'surface',
  'text',
  'textMuted',
  'accent',
  'accentHover',
  'primary',
  'border',
]

const THEME_FONT_KEYS = ['heading', 'body']
const THEME_SHADOW_KEYS = ['default', 'large']

/** @param {unknown} v */
function isNonEmptyString(v) {
  return v != null && String(v).trim() !== ''
}

/**
 * @param {string} path
 * @param {unknown} cond
 * @param {string} [detail]
 */
function req(path, cond, detail = '') {
  if (!cond) {
    throw new Error(
      `Sanity homepage: missing or invalid ${path}${detail ? ` (${detail})` : ''}`,
    )
  }
}

/**
 * @param {string} path
 * @param {unknown} v
 */
function reqStr(path, v) {
  const s = asStr(v)
  req(path, s.trim() !== '', `got ${JSON.stringify(v)}`)
  return s
}

/**
 * @param {string} path
 * @param {unknown} v
 */
function reqObj(path, v) {
  req(path, v != null && typeof v === 'object' && !Array.isArray(v))
  return /** @type {Record<string, unknown>} */ (v)
}

/**
 * @param {string} path
 * @param {unknown} arr
 * @param {number} [min]
 */
function reqArr(path, arr, min = 1) {
  req(
    path,
    Array.isArray(arr) && arr.length >= min,
    `expected at least ${min} items`,
  )
  return /** @type {unknown[]} */ (arr)
}

/**
 * @param {string} containerPath
 * @param {Record<string, unknown> | null | undefined} obj
 * @param {string} key
 */
function reqKeyInObject(containerPath, obj, key) {
  const s = asStr(obj?.[key])
  req(
    `${containerPath}["${key}"]`,
    s.trim() !== '',
    'expected non-empty value for this key',
  )
}

/**
 * @param {Record<string, unknown>} settings
 * @param {Record<string, unknown>} homePage
 */
export function assertSanityHomepage(settings, homePage) {
  req('siteSettings document', settings != null && typeof settings === 'object')
  req('homePage document', homePage != null && typeof homePage === 'object')

  const forms = reqObj('siteSettings.forms', settings.forms)
  reqStr('siteSettings.forms.submitPath', forms.submitPath)

  const business = reqObj('siteSettings.business', settings.business)
  const businessStr = [
    'companyName',
    'phoneDisplay',
    'phoneTel',
    'email',
    'addressShort',
    'descriptionShort',
    'copyrightSiteUrl',
    'logoHorizontalBlack',
    'logoHorizontalWhite',
  ]
  for (const k of businessStr) {
    reqStr(`siteSettings.business.${k}`, business[k])
  }

  const meta = reqObj('siteSettings.meta', settings.meta)
  reqStr('siteSettings.meta.title', meta.title)
  reqStr('siteSettings.meta.description', meta.description)

  const statsValues = reqObj('siteSettings.statsValues', settings.statsValues)
  reqStr('siteSettings.mapEmbedUrl', settings.mapEmbedUrl)

  const theme = reqObj('siteSettings.theme', settings.theme)
  const colors = reqObj('siteSettings.theme.colors', theme.colors)
  for (const k of THEME_COLOR_KEYS) {
    reqStr(`siteSettings.theme.colors.${k}`, colors[k])
  }
  const fonts = reqObj('siteSettings.theme.fonts', theme.fonts)
  for (const k of THEME_FONT_KEYS) {
    reqStr(`siteSettings.theme.fonts.${k}`, fonts[k])
  }
  const shadows = reqObj('siteSettings.theme.shadows', theme.shadows)
  for (const k of THEME_SHADOW_KEYS) {
    reqStr(`siteSettings.theme.shadows.${k}`, shadows[k])
  }

  const layoutBg = reqObj('homePage.layoutBackgrounds', homePage.layoutBackgrounds)
  reqStr('homePage.layoutBackgrounds.hero.imageSrc', layoutBg.hero?.imageSrc)
  reqStr('homePage.layoutBackgrounds.services.imageSrc', layoutBg.services?.imageSrc)
  reqStr('homePage.layoutBackgrounds.uniquePoints.imageSrc', layoutBg.uniquePoints?.imageSrc)

  const header = reqObj('homePage.header', homePage.header)
  const offerBar = reqObj('homePage.header.offerBar', header.offerBar)
  ;['textBeforeDiscount', 'discountLabel', 'textAfterDiscount', 'ctaText', 'ctaHref'].forEach(
    (k) => reqStr(`homePage.header.offerBar.${k}`, offerBar[k]),
  )
  const navItems = reqArr('homePage.header.navItems', header.navItems)
  for (let i = 0; i < navItems.length; i++) {
    const item = reqObj(`homePage.header.navItems[${i}]`, navItems[i])
    reqStr(`homePage.header.navItems[${i}].label`, item.label)
    const dropdown = item.dropdown
    if (Array.isArray(dropdown) && dropdown.length > 0) {
      dropdown.forEach((link, j) => {
        const l = reqObj(`homePage.header.navItems[${i}].dropdown[${j}]`, link)
        reqStr(`homePage.header.navItems[${i}].dropdown[${j}].label`, l.label)
        reqStr(`homePage.header.navItems[${i}].dropdown[${j}].href`, l.href)
      })
    } else {
      reqStr(`homePage.header.navItems[${i}].href`, item.href)
    }
  }
  reqStr('homePage.header.callCtaTemplate', header.callCtaTemplate)
  reqStr('homePage.header.logoAriaLabelTemplate', header.logoAriaLabelTemplate)

  const hero = reqObj('homePage.hero', homePage.hero)
  const hf = [
    'eyebrow',
    'headline',
    'lead',
    'callCtaTemplate',
    'formAriaLabel',
    'formKicker',
    'formHeadline',
    'formSub',
    'formSubmitCta',
    'formSubmitHref',
    'typedFallbackPhrase',
  ]
  for (const k of hf) {
    reqStr(`homePage.hero.${k}`, hero[k])
  }
  const heroForm = reqObj('homePage.hero.formFields', hero.formFields)
  ;[
    'nameLabel',
    'emailLabel',
    'phoneLabel',
    'cityLabel',
    'projectDetailsLabel',
    'requiredIndicator',
  ].forEach((k) => reqStr(`homePage.hero.formFields.${k}`, heroForm[k]))

  const typedPhrases = reqArr('homePage.hero.typedPhrases', hero.typedPhrases)
  typedPhrases.forEach((p, i) =>
    reqStr(`homePage.hero.typedPhrases[${i}]`, p),
  )

  const brands = reqObj('homePage.brandsMarquee', homePage.brandsMarquee)
  reqStr('homePage.brandsMarquee.ariaLabel', brands.ariaLabel)
  const brandList = reqArr('homePage.brandsMarquee.brands', brands.brands)
  brandList.forEach((b, i) => reqStr(`homePage.brandsMarquee.brands[${i}]`, b))

  const projects = reqObj('homePage.projects', homePage.projects)
  ;[
    'sectionAriaLabel',
    'headline',
    'controlsAriaLabel',
    'prevAriaLabel',
    'nextAriaLabel',
    'prevLabel',
    'nextLabel',
  ].forEach((k) => reqStr(`homePage.projects.${k}`, projects[k]))
  const slides = reqArr('homePage.projects.slides', projects.slides)
  slides.forEach((slide, i) => {
    const s = reqObj(`homePage.projects.slides[${i}]`, slide)
    reqStr(`homePage.projects.slides[${i}].imageSrc`, s.imageSrc)
    reqStr(`homePage.projects.slides[${i}].imageAlt`, s.imageAlt)
    reqStr(`homePage.projects.slides[${i}].location`, s.location)
  })

  const why = reqObj('homePage.whyChoose', homePage.whyChoose)
  ;['imageSrc', 'imageAlt', 'eyebrow', 'headline', 'lead', 'note'].forEach((k) =>
    reqStr(`homePage.whyChoose.${k}`, why[k]),
  )
  const stamp = reqObj('homePage.whyChoose.stamp', why.stamp)
  ;['homesCountTemplate', 'homesCountKey', 'line2', 'line3'].forEach((k) =>
    reqStr(`homePage.whyChoose.stamp.${k}`, stamp[k]),
  )
  reqKeyInObject('siteSettings.statsValues', statsValues, asStr(stamp.homesCountKey))
  const whyBullets = reqArr('homePage.whyChoose.bullets', why.bullets)
  whyBullets.forEach((b, i) => {
    const bl = reqObj(`homePage.whyChoose.bullets[${i}]`, b)
    reqStr(`homePage.whyChoose.bullets[${i}].title`, bl.title)
    reqStr(`homePage.whyChoose.bullets[${i}].text`, bl.text)
  })
  const whyCtas = reqObj('homePage.whyChoose.ctas', why.ctas)
  ;['callTemplate', 'estimate', 'estimateHref'].forEach((k) =>
    reqStr(`homePage.whyChoose.ctas.${k}`, whyCtas[k]),
  )

  const services = reqObj('homePage.services', homePage.services)
  reqStr('homePage.services.headline', services.headline)
  const svcItems = reqArr('homePage.services.items', services.items)
  svcItems.forEach((svc, i) => {
    const s = reqObj(`homePage.services.items[${i}]`, svc)
    reqStr(`homePage.services.items[${i}].number`, s.number)
    reqStr(`homePage.services.items[${i}].title`, s.title)
    reqStr(`homePage.services.items[${i}].description`, s.description)
  })

  const about = reqObj('homePage.about', homePage.about)
  ;['eyebrow', 'headline', 'lead', 'badgesAriaLabel'].forEach((k) =>
    reqStr(`homePage.about.${k}`, about[k]),
  )
  const abBullets = reqArr('homePage.about.bullets', about.bullets)
  abBullets.forEach((b, i) => reqStr(`homePage.about.bullets[${i}]`, b))
  const abBadges = reqArr('homePage.about.badges', about.badges)
  abBadges.forEach((b, i) => reqStr(`homePage.about.badges[${i}]`, b))
  const abCtas = reqObj('homePage.about.ctas', about.ctas)
  ;['callTemplate', 'estimate', 'estimateHref'].forEach((k) =>
    reqStr(`homePage.about.ctas.${k}`, abCtas[k]),
  )
  const av = reqObj('homePage.about.video', about.video)
  ;['posterSrc', 'sourceSrc', 'sourceType'].forEach((k) =>
    reqStr(`homePage.about.video.${k}`, av[k]),
  )

  const up = reqObj('homePage.uniquePoints', homePage.uniquePoints)
  reqStr('homePage.uniquePoints.eyebrow', up.eyebrow)
  reqStr('homePage.uniquePoints.headline', up.headline)
  const upItems = reqArr('homePage.uniquePoints.items', up.items)
  upItems.forEach((pt, i) => {
    const p = reqObj(`homePage.uniquePoints.items[${i}]`, pt)
    reqStr(`homePage.uniquePoints.items[${i}].iconId`, p.iconId)
    reqStr(`homePage.uniquePoints.items[${i}].title`, p.title)
    reqStr(`homePage.uniquePoints.items[${i}].description`, p.description)
  })

  const statsBar = reqObj('homePage.statsBar', homePage.statsBar)
  reqStr('homePage.statsBar.ariaLabel', statsBar.ariaLabel)
  const statItems = reqArr('homePage.statsBar.items', statsBar.items)
  statItems.forEach((row, i) => {
    const r = reqObj(`homePage.statsBar.items[${i}]`, row)
    reqStr(`homePage.statsBar.items[${i}].valueKey`, r.valueKey)
    reqStr(`homePage.statsBar.items[${i}].label`, r.label)
    reqKeyInObject('siteSettings.statsValues', statsValues, asStr(r.valueKey))
  })

  const cb = reqObj('homePage.contactBanner', homePage.contactBanner)
  ;['headline', 'paragraph1', 'paragraph2', 'phoneIconSrc'].forEach((k) =>
    reqStr(`homePage.contactBanner.${k}`, cb[k]),
  )

  const rev = reqObj('homePage.reviews', homePage.reviews)
  reqStr('homePage.reviews.headline', rev.headline)
  reqStr('homePage.reviews.postedOnLabel', rev.postedOnLabel)
  const rv = reqObj('homePage.reviews.reviewValues', rev.reviewValues)
  const sum = reqObj('homePage.reviews.summary', rev.summary)
  ;[
    'brandLabel',
    'googleIconSrc',
    'googleIconLocation',
    'ratingValueKey',
    'starsImageSrc',
    'starsImageLocation',
    'starsImageAlt',
    'reviewCountKey',
    'reviewCountPrefix',
    'reviewCountSuffix',
    'ctaText',
    'ctaHref',
  ].forEach((k) => reqStr(`homePage.reviews.summary.${k}`, sum[k]))
  reqKeyInObject('homePage.reviews.reviewValues', rv, asStr(sum.ratingValueKey))
  reqKeyInObject('homePage.reviews.reviewValues', rv, asStr(sum.reviewCountKey))

  const tms = reqArr('homePage.reviews.testimonials', rev.testimonials)
  tms.forEach((t, i) => {
    const x = reqObj(`homePage.reviews.testimonials[${i}]`, t)
    ;['author', 'timeAgo', 'avatarSrc', 'avatarLocation', 'quote'].forEach((k) =>
      reqStr(`homePage.reviews.testimonials[${i}].${k}`, x[k]),
    )
  })

  const sa = reqObj('homePage.serviceArea', homePage.serviceArea)
  ;[
    'eyebrow',
    'headline',
    'intro',
    'mapEmbedUrlKey',
    'mapIframeTitleTemplate',
    'citiesLabel',
    'citiesNavAriaLabel',
  ].forEach((k) => reqStr(`homePage.serviceArea.${k}`, sa[k]))
  const cities = reqArr('homePage.serviceArea.cities', sa.cities)
  cities.forEach((c, i) => {
    const city = reqObj(`homePage.serviceArea.cities[${i}]`, c)
    reqStr(`homePage.serviceArea.cities[${i}].name`, city.name)
    reqStr(`homePage.serviceArea.cities[${i}].href`, city.href)
  })

  const tm = reqObj('homePage.team', homePage.team)
  reqStr('homePage.team.headline', tm.headline)
  const members = reqArr('homePage.team.members', tm.members)
  members.forEach((m, i) => {
    const mem = reqObj(`homePage.team.members[${i}]`, m)
    ;['imageSrc', 'imageAlt', 'location', 'name', 'bio'].forEach((k) =>
      reqStr(`homePage.team.members[${i}].${k}`, mem[k]),
    )
  })

  const faq = reqObj('homePage.faq', homePage.faq)
  reqStr('homePage.faq.headline', faq.headline)
  reqStr('homePage.faq.headingId', faq.headingId)
  const faqItems = reqArr('homePage.faq.items', faq.items)
  faqItems.forEach((item, i) => {
    const it = reqObj(`homePage.faq.items[${i}]`, item)
    reqStr(`homePage.faq.items[${i}].question`, it.question)
    reqStr(`homePage.faq.items[${i}].answerHtml`, it.answerHtml)
  })

  const fe = reqObj('homePage.footerEstimate', homePage.footerEstimate)
  reqStr('homePage.footerEstimate.headline', fe.headline)
  reqStr('homePage.footerEstimate.intro', fe.intro)
  reqStr('homePage.footerEstimate.formAction', fe.formAction)
  reqStr('homePage.footerEstimate.formMethod', fe.formMethod)
  const fef = reqObj('homePage.footerEstimate.formFields', fe.formFields)
  ;[
    'nameLabel',
    'emailLabel',
    'phoneLabel',
    'cityLabel',
    'projectDetailsLabel',
    'submitButton',
  ].forEach((k) => reqStr(`homePage.footerEstimate.formFields.${k}`, fef[k]))

  const fb = reqObj('homePage.footerBrand', homePage.footerBrand)
  reqStr('homePage.footerBrand.tagline', fb.tagline)
  reqStr('homePage.footerBrand.socialAriaLabel', fb.socialAriaLabel)
  const socials = reqArr('homePage.footerBrand.socialLinks', fb.socialLinks)
  socials.forEach((s, i) => {
    const sl = reqObj(`homePage.footerBrand.socialLinks[${i}]`, s)
    reqStr(`homePage.footerBrand.socialLinks[${i}].platform`, sl.platform)
    reqStr(`homePage.footerBrand.socialLinks[${i}].href`, sl.href)
    reqStr(`homePage.footerBrand.socialLinks[${i}].ariaLabel`, sl.ariaLabel)
  })

  const fcols = reqArr('homePage.footerColumns', homePage.footerColumns)
  fcols.forEach((col, i) => {
    const c = reqObj(`homePage.footerColumns[${i}]`, col)
    reqStr(`homePage.footerColumns[${i}].heading`, c.heading)
    const hasLinks = Array.isArray(c.links) && c.links.length > 0
    const hasHours =
      isNonEmptyString(c.hoursHeading) && isNonEmptyString(c.hoursText)
    req(
      `homePage.footerColumns[${i}]`,
      hasLinks || hasHours,
      'each column needs either links[] or hoursHeading + hoursText',
    )
    if (hasLinks) {
      reqStr(`homePage.footerColumns[${i}].ariaLabel`, c.ariaLabel)
      c.links.forEach((link, j) => {
        const l = reqObj(`homePage.footerColumns[${i}].links[${j}]`, link)
        reqStr(`homePage.footerColumns[${i}].links[${j}].label`, l.label)
        reqStr(`homePage.footerColumns[${i}].links[${j}].href`, l.href)
      })
    }
    if (hasHours) {
      reqStr(`homePage.footerColumns[${i}].hoursHeading`, c.hoursHeading)
      reqStr(`homePage.footerColumns[${i}].hoursText`, c.hoursText)
    }
  })

  const fs = reqObj('homePage.footerSupport', homePage.footerSupport)
  reqStr('homePage.footerSupport.ariaLabel', fs.ariaLabel)
  reqStr('homePage.footerSupport.copyrightTemplate', fs.copyrightTemplate)
  const fsLinks = reqArr('homePage.footerSupport.links', fs.links)
  fsLinks.forEach((link, i) => {
    const l = reqObj(`homePage.footerSupport.links[${i}]`, link)
    reqStr(`homePage.footerSupport.links[${i}].label`, l.label)
    reqStr(`homePage.footerSupport.links[${i}].href`, l.href)
  })
}
