/**
 * JSON-LD for schema.org HomeAndConstructionBusiness (LocalBusiness).
 * Data from Site settings → Business + Business listings.
 */
import { asStr, mediaUrl } from './sanity-strings.js'

/** Matches astro.config.mjs `site` — absolute URLs for image / @id */
export const CANONICAL_SITE_ORIGIN = 'https://www.milehighgutter.com'

/**
 * @param {string} raw
 * @returns {string}
 */
function normalizeSiteUrl(raw) {
  const s = String(raw || '').trim()
  if (!s) return CANONICAL_SITE_ORIGIN
  if (/^https?:\/\//i.test(s)) return s.replace(/\/+$/, '') || CANONICAL_SITE_ORIGIN
  return `${CANONICAL_SITE_ORIGIN.replace(/\/+$/, '')}/${s.replace(/^\/+/, '')}`
}

/**
 * @param {Record<string, unknown>} settings siteSettings merge result
 * @returns {string | null} Serialized JSON-LD or null if no business name
 */
export function buildHomeAndConstructionBusinessJsonLd(settings) {
  const business = settings?.business ?? {}
  const listings = settings?.businessListings ?? {}

  const name = asStr(business.companyName).trim()
  if (!name) return null

  const url = normalizeSiteUrl(asStr(business.websiteUrl))
  const telephone = asStr(business.phoneDisplay).trim() || formatTelForSchema(asStr(business.phoneTel))
  const email = asStr(business.email).trim()
  let description =
    asStr(business.descriptionShort).trim() || asStr(business.descriptionLong).trim()
  const hours = asStr(business.hoursText).trim()
  if (hours) {
    description = description ? `${description} ${hours}` : hours
  }

  const logoPath = asStr(business.logoHorizontalBlack) || asStr(business.logoHorizontalWhite)
  const image = logoPath
    ? `${CANONICAL_SITE_ORIGIN.replace(/\/+$/, '')}${mediaUrl(logoPath)}`
    : undefined

  const addressLine = asStr(business.addressShort).trim()
  /** @type {Record<string, unknown> | undefined} */
  let address
  if (addressLine) {
    address = {
      '@type': 'PostalAddress',
      streetAddress: addressLine,
      addressCountry: 'US',
    }
    const locality = asStr(business.addressMetro).trim()
    if (locality) {
      address.addressLocality = locality
    }
  }

  const sameAs = [
    asStr(listings.googleMaps),
    asStr(listings.facebook),
    asStr(listings.instagram),
    asStr(listings.twitter),
    asStr(listings.linkedin),
    asStr(listings.yelp),
    asStr(listings.bingPlaces),
  ]
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u))

  const hasMap = asStr(listings.googleMaps).trim()
  const areaName = asStr(business.addressMetro).trim() || 'Denver, CO'

  /** @type {Record<string, unknown>} */
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${url}#business`,
    name,
    url,
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(description ? { description } : {}),
    ...(image ? { image: { '@type': 'ImageObject', url: image } } : {}),
    ...(address ? { address } : {}),
    ...(hasMap ? { hasMap } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    areaServed: {
      '@type': 'AdministrativeArea',
      name: areaName,
    },
  }

  const foundingDate = asStr(business.dateOpened).trim()
  if (foundingDate) {
    data.foundingDate = foundingDate
  }

  let json = JSON.stringify(data)
  json = json.replace(/</g, '\\u003c')
  return json
}

/**
 * @param {string} tel
 * @returns {string}
 */
function formatTelForSchema(tel) {
  const d = String(tel || '').replace(/\D/g, '')
  if (d.length === 10) return `+1${d}`
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  return String(tel || '').trim()
}
