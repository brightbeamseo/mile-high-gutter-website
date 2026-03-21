#!/usr/bin/env python3
"""Generate astro-site/src/pages/index.astro from root index.html (run from repo root)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
OUT = ROOT / "astro-site" / "src" / "pages" / "index.astro"


def main() -> None:
    html = HTML.read_text(encoding="utf-8")
    start = html.index('<header class="header"')
    end = html.index('<script type="application/json" id="homepage-typed-phrases">')
    inner = html[start:end].strip()

    inner = inner.replace("+13037629841", "{tel}")
    inner = inner.replace("(303) 762-9841", "{phoneDisplay}")
    inner = inner.replace("Mile High Gutter Denver", "{companyName}")
    inner = inner.replace("office@milehighgutter.com", "{email}")
    inner = inner.replace("3300 S Federal Blvd, Englewood, CO 80110", "{address}")

    map_needle = (
        'src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d393176.63622688083!2d-105.63456111093751!3d39.6566351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x876b8636aaaaaaab%3A0x82de48ab5054a084!2sMile%20High%20Gutter%20LLC!5e0!3m2!1sen!2sus!4v1774033385651!5m2!1sen!2sus"'
    )
    inner = inner.replace(map_needle, "src={mapEmbedUrl}")

    inner = inner.replace("<strong>40+</strong>", "<strong>{statsYears}</strong>")
    inner = inner.replace("<strong>32,500+</strong>", "<strong>{statsJobs}</strong>", 1)
    inner = inner.replace("<strong>4.8/5</strong>", "<strong>{statsAvg}</strong>")
    inner = inner.replace("<strong>5 Min</strong>", "<strong>{statsResponse}</strong>")
    inner = inner.replace("<strong>Over 32,500+</strong>", "<strong>Over {homesCount}</strong>")

    inner = re.sub(
        r'(<p class="reviews-summary-rating">\s*)<strong>4\.8</strong>',
        r"\1<strong>{reviewRating}</strong>",
        inner,
        count=1,
    )
    inner = inner.replace('<span>(171)</span>', "<span>({reviewCount})</span>", 1)

    inner = inner.replace(
        "<p class=\"footer-address\">Serving homeowners and businesses across the Denver metro with dependable gutter installation, repair, cleaning, and guards.</p>",
        "<p class=\"footer-address\">{descriptionShort}</p>",
    )
    inner = inner.replace(
        "<p><a href=\"https://www.milehighgutter.com/\">© <span id=\"year\"></span> — {companyName}</a></p>",
        "<p><a href={copyrightHref}>© <span id=\"year\"></span> — {companyName}</a></p>",
    )

    def repl_src(m: re.Match[str]) -> str:
        p = m.group(1)
        return "src={mediaUrl(`Media (MHG)/" + p + "`)}"

    inner = re.sub(r'src="Media \(MHG\)/([^"]+)"', repl_src, inner)

    def repl_poster(m: re.Match[str]) -> str:
        p = m.group(1)
        return "poster={mediaUrl(`Media (MHG)/" + p + "`)}"

    inner = re.sub(r'poster="Media \(MHG\)/([^"]+)"', repl_poster, inner)

    social = [
        ("https://www.facebook.com/milehighgutter/", "facebook"),
        ("https://www.instagram.com/milehighgutterllc/", "instagram"),
        ("https://maps.app.goo.gl/bbaPvDTVzQnZ1FEy9", "googleMaps"),
        ("https://x.com/milehighgutter1", "twitter"),
        ("https://www.linkedin.com/in/mile-high-gutter-620475222", "linkedin"),
        ("https://www.yelp.com/biz/mile-high-gutter-englewood-2", "yelp"),
    ]
    for url, key in social:
        inner = inner.replace(f'href="{url}"', f"href={{listings.{key} ?? '#'}}")

    inner = inner.replace('href="tel:{tel}"', "href={telLink}")
    inner = inner.replace('href="mailto:{email}"', "href={mailtoLink}")
    inner = inner.replace(">Call: {phoneDisplay}<", ">{callLabel}<")

    # Astro must bind dynamic text/ARIA with expressions (not literal "{companyName}")
    inner = inner.replace('aria-label="{companyName} home"', "aria-label={companyName + ' home'}")
    inner = inner.replace('alt="{companyName}"', "alt={companyName}")
    inner = inner.replace(
        'title="{companyName} service area map"',
        "title={companyName + ' service area map'}",
    )
    inner = inner.replace(
        'aria-label="{companyName} on Facebook"',
        "aria-label={companyName + ' on Facebook'}",
    )
    inner = inner.replace(
        'aria-label="{companyName} on Instagram"',
        "aria-label={companyName + ' on Instagram'}",
    )
    inner = inner.replace(
        'aria-label="{companyName} on Google Maps"',
        "aria-label={companyName + ' on Google Maps'}",
    )
    inner = inner.replace(
        'aria-label="{companyName} on X"',
        "aria-label={companyName + ' on X'}",
    )
    inner = inner.replace(
        'aria-label="{companyName} on LinkedIn"',
        "aria-label={companyName + ' on LinkedIn'}",
    )
    inner = inner.replace(
        'aria-label="{companyName} on Yelp"',
        "aria-label={companyName + ' on Yelp'}",
    )

    front = """---
import BaseLayout from '../layouts/BaseLayout.astro'
import { sanity } from '../lib/sanity.js'

const settings = await sanity.fetch(`*[_type == "siteSettings"][0]`)
const homePage = await sanity.fetch(`*[_type == "homePage"][0]{ reviews }`)

/** NAP + logos + descriptionShort live on settings.business (JSON shape). */
const business = settings?.business ?? {}
const meta = settings?.meta ?? {}
const statsValues = settings?.statsValues ?? {}
const listings = settings?.businessListings ?? {}

const companyName = business.companyName ?? ''
const phoneDisplay = business.phoneDisplay ?? ''
const tel = business.phoneTel ?? ''
const email = business.email ?? ''
const address = business.addressShort ?? ''
/** Same field as JSON `business.descriptionShort` (not a separate top-level settings field). */
const descriptionShort = business.descriptionShort ?? ''
const copyrightHref = business.copyrightSiteUrl || business.websiteUrl || '/'

const pageTitle = meta.title || companyName || 'Mile High Gutter'
const pageDescription = meta.description || descriptionShort || ''

const statsYears = statsValues.statsYearsExperience ?? ''
const statsJobs = statsValues.statsJobsCompleted ?? ''
const statsAvg = statsValues.statsAvgRating ?? ''
const statsResponse = statsValues.statsResponseTime ?? ''
const homesCount = statsValues.whyChooseHomesCount ?? ''

const mapEmbedUrl = settings?.mapEmbedUrl || ''

const reviewValues = homePage?.reviews?.reviewValues ?? {}
const reviewRating = reviewValues.reviewsRating ?? ''
const reviewCount = reviewValues.reviewsCount ?? ''

function mediaUrl(relPath) {
  if (!relPath) return ''
  return '/' + String(relPath).split('/').map(encodeURIComponent).join('/')
}

const callLabel = tel && phoneDisplay ? `Call: ${phoneDisplay}` : ''
const telLink = tel ? `tel:${tel}` : '#'
const mailtoLink = email ? `mailto:${email}` : '#'
---

<BaseLayout title={pageTitle} description={pageDescription}>
"""

    foot = """
  <script type="application/json" id="homepage-typed-phrases" set:html={JSON.stringify([
    'Gutter Installation',
    'Gutter Repair',
    'Gutter Cleaning',
    'Gutter Guards',
    'Heated Gutters',
    'Soffit & Fascia',
  ])} />
</BaseLayout>
"""

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(front + inner + foot, encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
