#!/usr/bin/env python3
"""
Renders homepage HTML sections from shared/homepage-content.json.
Layout/classes match the previous static section files; only copy comes from JSON.
"""
from __future__ import annotations

import json
import re
from html import escape as esc
from typing import Any

# JSON theme.colors keys → CSS custom properties (see styles.css :root)
_THEME_COLOR_VARS: dict[str, str] = {
    "background": "--color-bg",
    "backgroundAlt": "--color-bg-alt",
    "surface": "--color-surface",
    "text": "--color-text",
    "textMuted": "--color-text-muted",
    "accent": "--color-accent",
    "accentHover": "--color-accent-hover",
    "primary": "--color-dark",
    "border": "--color-border",
}
_THEME_FONT_VARS: dict[str, str] = {
    "heading": "--font-heading",
    "body": "--font-body",
}
_THEME_SHADOW_VARS: dict[str, str] = {
    "default": "--shadow",
    "large": "--shadow-lg",
}

_DEFAULT_THEME: dict[str, dict[str, str]] = {
    "colors": {
        "background": "#fafbfc",
        "backgroundAlt": "#f2f4f8",
        "surface": "#ffffff",
        "text": "#384555",
        "textMuted": "#5c6b7a",
        "accent": "#527BBD",
        "accentHover": "#4369a8",
        "primary": "#143980",
        "border": "#e2e6ee",
    },
    "fonts": {
        "heading": '"Poppins", system-ui, sans-serif',
        "body": '"Merriweather", Georgia, serif',
    },
    "shadows": {
        "default": "0 4px 24px rgba(20, 57, 128, 0.06)",
        "large": "0 16px 48px rgba(20, 57, 128, 0.1)",
    },
}


def _sanitize_css_token(value: str) -> str:
    """Strip characters that could break </style> or inject markup."""
    return str(value).replace("<", "").replace(">", "").strip()


def generate_theme_css(home: dict[str, Any]) -> str:
    """
    Build a :root { ... } block from home['theme'] merged with defaults.
    Injected after styles.css so these override file defaults.
    """
    raw = home.get("theme") or {}
    colors = {**_DEFAULT_THEME["colors"], **(raw.get("colors") or {})}
    fonts = {**_DEFAULT_THEME["fonts"], **(raw.get("fonts") or {})}
    shadows = {**_DEFAULT_THEME["shadows"], **(raw.get("shadows") or {})}

    lines: list[str] = [":root {"]
    for json_key, css_var in _THEME_COLOR_VARS.items():
        if json_key in colors and colors[json_key]:
            val = _sanitize_css_token(colors[json_key])
            lines.append(f"  {css_var}: {val};")
    for json_key, css_var in _THEME_FONT_VARS.items():
        if json_key in fonts and fonts[json_key]:
            val = _sanitize_css_token(fonts[json_key])
            lines.append(f"  {css_var}: {val};")
    for json_key, css_var in _THEME_SHADOW_VARS.items():
        if json_key in shadows and shadows[json_key]:
            val = _sanitize_css_token(shadows[json_key])
            lines.append(f"  {css_var}: {val};")
    lines.append("}")
    return "\n".join(lines)


def forms_head_fragments(home: dict[str, Any]) -> tuple[str, str]:
    """
    JSON for #site-forms-config (safe inside <script type="application/json">)
    and optional reCAPTCHA v3 loader tag.
    """
    forms = home.get("forms") or {}
    submit_path = (forms.get("submitPath") or "/api/lead").strip() or "/api/lead"
    if not submit_path.startswith("/"):
        submit_path = "/" + submit_path.lstrip("/")
    site_key = (forms.get("recaptchaSiteKey") or "").strip()
    cfg = {"submitPath": submit_path, "recaptchaSiteKey": site_key}
    raw_json = json.dumps(cfg, separators=(",", ":"))
    safe_json = raw_json.replace("<", "\\u003c")
    recaptcha_tag = ""
    if site_key and re.match(r"^[0-9A-Za-z_-]+$", site_key):
        recaptcha_tag = (
            f'<script src="https://www.google.com/recaptcha/api.js?render={site_key}" '
            "async defer></script>"
        )
    return safe_json, recaptcha_tag


def build_flat_context(home: dict[str, Any]) -> dict[str, str]:
    """Flatten business + meta + stats + review counts + map URL for {{placeholder}} substitution."""
    ctx: dict[str, str] = {}
    for k, v in home["business"].items():
        if isinstance(v, (str, int, float, bool)):
            ctx[k] = str(v)
    meta = home["meta"]
    ctx["title"] = meta["title"]
    ctx["metaDescription"] = meta["description"]
    ctx.update(home["statsValues"])
    ctx.update(home["reviews"]["reviewValues"])
    ctx["mapEmbedUrl"] = home["mapEmbedUrl"]
    ctx["themeCss"] = generate_theme_css(home)
    forms_json, recaptcha_tag = forms_head_fragments(home)
    ctx["formsConfigJson"] = forms_json
    ctx["recaptchaScriptTag"] = recaptcha_tag
    return ctx


def sub_ctx(template: str, ctx: dict[str, str]) -> str:
    """Replace {{key}} in template string."""
    out = template
    for k, v in ctx.items():
        out = out.replace("{{" + k + "}}", str(v))
    return out


# SVG markup per iconId — design stays in code; JSON picks which icon + text.
UNIQUE_ICONS: dict[str, str] = {
    "clock": """<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"></circle>
              <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>""",
    "clipboard": """<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
              <path d="M8 6h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
              <rect x="8.5" y="10" width="2" height="2" rx="0.5" fill="none" stroke="currentColor" stroke-width="2"></rect>
              <rect x="12" y="10" width="2" height="2" rx="0.5" fill="none" stroke="currentColor" stroke-width="2"></rect>
              <rect x="15.5" y="10" width="2" height="2" rx="0.5" fill="none" stroke="currentColor" stroke-width="2"></rect>
              <rect x="8.5" y="13.5" width="2" height="2" rx="0.5" fill="none" stroke="currentColor" stroke-width="2"></rect>
              <rect x="12" y="13.5" width="2" height="2" rx="0.5" fill="none" stroke="currentColor" stroke-width="2"></rect>
              <rect x="15.5" y="13.5" width="2" height="2" rx="0.5" fill="none" stroke="currentColor" stroke-width="2"></rect>
            </svg>""",
    "shield-check": """<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l8 4v6c0 5-3.6 9.7-8 10-4.4-.3-8-5-8-10V6l8-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
              <path d="M9 12l2 2 4-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>""",
    "package": """<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
              <path d="M3.3 7.6 12 12l8.7-4.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>""",
    "sparkle": """<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l1.6 4.6L18 8l-4.4 1.4L12 14l-1.6-4.6L6 8l4.4-1.4L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
              <path d="M19 14l.9 2.6L22 17l-2.1.4L19 20l-.9-2.6L16 17l2.1-.4L19 14Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
            </svg>""",
    "message": """<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
              <path d="M8 9h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
              <path d="M8 13h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            </svg>""",
}


def _nav_slug(label: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
    return s or "nav"


def _render_nav_items(hdr: dict[str, Any]) -> str:
    """Build main nav from header.navItems (flat links or dropdowns)."""
    items: list[str] = []
    for item in hdr["navItems"]:
        if item.get("dropdown"):
            slug = _nav_slug(item["label"])
            dd_id = f"nav-dd-{slug}"
            subs = "\n".join(
                f'              <li role="none"><a href="{esc(s["href"], quote=True)}" role="menuitem">{esc(s["label"])}</a></li>'
                for s in item["dropdown"]
            )
            items.append(
                f"""          <div class="nav-dropdown" data-nav-dropdown>
            <button type="button" class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true" aria-controls="{dd_id}" id="{dd_id}-btn">
              {esc(item["label"])}
              <span class="nav-dropdown-chevron" aria-hidden="true"></span>
            </button>
            <ul class="nav-dropdown-menu" id="{dd_id}" role="menu">
{subs}
            </ul>
          </div>"""
            )
        else:
            items.append(
                f'          <a href="{esc(item["href"], quote=True)}">{esc(item["label"])}</a>'
            )
    return "\n".join(items)


def render_header(home: dict[str, Any], ctx: dict[str, str]) -> str:
    hdr = home["header"]
    ob = hdr["offerBar"]
    nav = _render_nav_items(hdr)
    call = sub_ctx(hdr.get("callCtaTemplate", "Call: {{phoneDisplay}}"), ctx)
    return f"""  <header class="header">
    <div class="offer-bar">
      <div class="offer-bar-inner">
        <p class="offer-message">
          {esc(ob["textBeforeDiscount"])}<strong>{esc(ob["discountLabel"])}</strong>{esc(ob["textAfterDiscount"])}
          <a href="{esc(ob["ctaHref"], quote=True)}" class="offer-link"><strong>{esc(ob["ctaText"])}</strong></a>
        </p>
      </div>
    </div>

    <div class="header-nav">
      <div class="header-inner">
        <a href="/" class="logo" aria-label="{esc(ctx["companyName"])} home">
          <img src="{esc(ctx["logoHorizontalBlack"], quote=True)}" alt="{esc(ctx["companyName"], quote=True)}" class="logo-img">
        </a>
        <button class="nav-toggle" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
        <nav class="nav">
          {nav}
          <a href="tel:{esc(ctx["phoneTel"], quote=True)}" class="btn btn-primary btn-lg">{esc(call)}</a>
        </nav>
      </div>
    </div>
  </header>
  <div id="header-nav-spacer" class="header-nav-spacer" aria-hidden="true"></div>
"""


def brands_groups_html(brands: list[str]) -> str:
    pills = "\n              ".join(f'<span class="brand-pill">{esc(b)}</span>' for b in brands)
    group = f"""            <div class="brands-group">
              {pills}
            </div>"""
    dup = f"""            <div class="brands-group" aria-hidden="true">
              {pills}
            </div>"""
    return f"{group}\n{dup}\n{dup}"


def render_hero(home: dict[str, Any], ctx: dict[str, str]) -> str:
    hero = home["hero"]
    bm = home["brandsMarquee"]
    ff = hero["formFields"]
    call = sub_ctx(hero.get("callCtaTemplate", "Call: {{phoneDisplay}}"), ctx)

    brands_inner = brands_groups_html(bm["brands"])

    return f"""    <section class="hero hero-split">
      <div class="hero-bg"></div>
      <div class="container hero-split-inner">
        <div class="hero-copy">
          <div class="hero-eyebrow">{esc(hero["eyebrow"])}</div>
          <h1>{esc(hero["headline"])}</h1>
          <p class="hero-typed" aria-live="polite"><span id="hero-typed-text"></span><span class="hero-caret" aria-hidden="true">|</span></p>
          <p class="hero-lead">{esc(hero["lead"])}</p>
          <div class="hero-actions">
            <a href="tel:{esc(ctx["phoneTel"], quote=True)}" class="btn btn-primary btn-lg cta1-primary-call">{esc(call)}</a>
          </div>
        </div>
        <form class="hero-form" data-lead-form="hero" action="#" method="post" aria-label="{esc(hero["formAriaLabel"], quote=True)}">
          <div class="hero-form-heading">
            <div class="hero-form-kicker">{esc(hero["formKicker"])}</div>
            <h2>{esc(hero["formHeadline"])}</h2>
          </div>
          <p class="hero-form-sub">{esc(hero["formSub"])}</p>
          <div class="hero-form-grid">
            <div class="hero-form-field">
              <label for="hero-name">{esc(ff["nameLabel"])} <span class="required-mark" aria-hidden="true">{esc(ff["requiredIndicator"])}</span></label>
              <input id="hero-name" name="name" type="text" required autocomplete="name">
            </div>
            <div class="hero-form-field">
              <label for="hero-email">{esc(ff["emailLabel"])} <span class="required-mark" aria-hidden="true">{esc(ff["requiredIndicator"])}</span></label>
              <input id="hero-email" name="email" type="email" required autocomplete="email">
            </div>
            <div class="hero-form-field">
              <label for="hero-phone">{esc(ff["phoneLabel"])} <span class="required-mark" aria-hidden="true">{esc(ff["requiredIndicator"])}</span></label>
              <input id="hero-phone" name="phone" type="tel" required autocomplete="tel">
            </div>
            <div class="hero-form-field">
              <label for="hero-location">{esc(ff["cityLabel"])}</label>
              <input id="hero-location" name="location" type="text" autocomplete="address-level2">
            </div>
            <div class="hero-form-field hero-form-field-full">
              <label for="hero-message">{esc(ff["projectDetailsLabel"])}</label>
              <textarea id="hero-message" name="message" rows="3"></textarea>
            </div>
          </div>
          <div class="lead-form-honeypot-wrap" aria-hidden="true">
            <label for="hero-website">Leave blank</label>
            <input type="text" id="hero-website" name="website" tabindex="-1" autocomplete="off">
          </div>
          <p class="lead-form-status" data-lead-form-status role="status" aria-live="polite"></p>
          <button type="submit" class="btn btn-primary btn-lg">{esc(hero["formSubmitCta"])}</button>
        </form>
      </div>
      <section class="brands-marquee" aria-label="{esc(bm["ariaLabel"], quote=True)}">
        <div class="brands-track">
          <div class="brands-inner">
{brands_inner}
          </div>
        </div>
      </section>
    </section>
"""


def render_projects(home: dict[str, Any], _ctx: dict[str, str]) -> str:
    p = home["projects"]
    slides = []
    for slide in p["slides"]:
        # Pin text on the slide comes from JSON `location` (see shared/homepage-content.json).
        loc = (slide.get("location") or slide.get("locationLabel") or "").strip()
        aria = f"Gutter project photo — {loc}" if loc else "Gutter project photo"
        slides.append(
            f"""        <article class="project-slide" data-location="{esc(loc, quote=True)}" aria-label="{esc(aria, quote=True)}">
          <img src="{esc(slide["imageSrc"], quote=True)}" alt="{esc(slide["imageAlt"], quote=True)}">
          <div class="project-meta"><span class="project-pin" aria-hidden="true">📍</span> <span class="project-location-label">{esc(loc)}</span></div>
        </article>"""
        )
    slides_html = "\n".join(slides)
    return f"""    <section id="projects" class="image-scroller" aria-label="{esc(p["sectionAriaLabel"], quote=True)}">
      <div class="container projects-head">
        <h2 class="section-title">{esc(p["headline"])}</h2>
      </div>
      <div class="projects-carousel" id="projects-carousel">
{slides_html}
      </div>
      <div class="projects-controls projects-controls-bottom" aria-label="{esc(p["controlsAriaLabel"], quote=True)}">
        <button type="button" class="project-nav" id="projects-prev" aria-label="{esc(p["prevAriaLabel"], quote=True)}">{esc(p["prevLabel"])}</button>
        <button type="button" class="project-nav" id="projects-next" aria-label="{esc(p["nextAriaLabel"], quote=True)}">{esc(p["nextLabel"])}</button>
      </div>
    </section>
"""


def render_why_choose(home: dict[str, Any], ctx: dict[str, str]) -> str:
    w = home["whyChoose"]
    stamp = w["stamp"]
    homes = ctx[stamp["homesCountKey"]]
    stamp_line1 = stamp.get("homesCountTemplate", "{{count}} Homes").replace("{{count}}", homes)
    bullets = "\n".join(
        f'            <li><strong>{esc(b["title"])}</strong> {esc(b["text"])}</li>' for b in w["bullets"]
    )
    call = sub_ctx(w["ctas"].get("callTemplate", "Call: {{phoneDisplay}}"), ctx)
    return f"""    <section class="section why-simple">
      <div class="container why-choose-layout">
        <div class="why-choose-image-wrap">
          <img src="{esc(w["imageSrc"], quote=True)}" alt="{esc(w["imageAlt"], quote=True)}" class="why-choose-image">
          <div class="why-choose-stamp">
            <strong>{esc(stamp_line1)}</strong>
            <span>{esc(stamp["line2"])}</span>
            <span>{esc(stamp["line3"])}</span>
          </div>
        </div>
        <div class="why-choose-content">
          <div class="why-eyebrow">{esc(w["eyebrow"])}</div>
          <h2 class="section-title section-title-secondary">{esc(w["headline"])}</h2>
          <p class="section-lead">{esc(w["lead"])}</p>
          <ul class="why-choose-list">
{bullets}
          </ul>
          <p class="why-choose-note">{esc(w["note"])}</p>
          <div class="why-choose-actions">
            <a href="tel:{esc(ctx["phoneTel"], quote=True)}" class="btn btn-primary btn-lg">{esc(call)}</a>
            <a href="{esc(w["ctas"]["estimateHref"], quote=True)}" class="btn btn-outline btn-lg request-estimate">{esc(w["ctas"]["estimate"])}</a>
          </div>
        </div>
      </div>
    </section>
"""


def render_services(home: dict[str, Any], _ctx: dict[str, str]) -> str:
    s = home["services"]
    cards = []
    for it in s["items"]:
        cards.append(
            f"""          <article class="service-card">
            <div class="service-image-wrap">
              <span class="service-number">{esc(it["number"])}</span>
              <h3 class="service-title">{esc(it["title"])}</h3>
              <p class="service-desc">{esc(it["description"])}</p>
            </div>
          </article>"""
        )
    return f"""    <section id="services" class="section services">
      <div class="container">
        <h2 class="section-title">{esc(s["headline"])}</h2>
        <div class="services-grid">
{chr(10).join(cards)}
        </div>
      </div>
    </section>
"""


def render_about(home: dict[str, Any], ctx: dict[str, str]) -> str:
    a = home["about"]
    v = a["video"]
    bl = "\n".join(f"            <li>{esc(x)}</li>" for x in a["bullets"])
    badges = "\n".join(f'            <div class="about-badge">{esc(b)}</div>' for b in a["badges"])
    call = sub_ctx(a["ctas"].get("callTemplate", "Call: {{phoneDisplay}}"), ctx)
    return f"""    <section class="section about about-video">
      <div class="container about-grid">
        <div class="about-content">
          <div class="about-eyebrow">{esc(a["eyebrow"])}</div>
          <h2 class="section-title">{esc(a["headline"])}</h2>
          <p class="about-lead">{esc(a["lead"])}</p>

          <ul class="about-list">
{bl}
          </ul>

          <div class="about-video-actions">
            <a href="tel:{esc(ctx["phoneTel"], quote=True)}" class="btn btn-primary btn-lg">{esc(call)}</a>
            <a href="{esc(a["ctas"]["estimateHref"], quote=True)}" class="btn btn-outline btn-lg request-estimate">{esc(a["ctas"]["estimate"])}</a>
          </div>
        </div>

        <div class="about-visual">
          <div class="media-card media-video">
            <video controls playsinline preload="metadata" poster="{esc(v["posterSrc"], quote=True)}">
              <source src="{esc(v["sourceSrc"], quote=True)}" type="{esc(v["sourceType"], quote=True)}">
            </video>
          </div>

          <div class="about-badges" aria-label="{esc(a["badgesAriaLabel"], quote=True)}">
{badges}
          </div>
        </div>
      </div>
    </section>
"""


def render_unique_points(home: dict[str, Any], _ctx: dict[str, str]) -> str:
    u = home["uniquePoints"]
    articles = []
    for it in u["items"]:
        svg = UNIQUE_ICONS.get(it["iconId"], "")
        articles.append(
            f"""          <article class="result-item"><span class="result-value"><span class="result-icon" aria-hidden="true">
            {svg}
          </span>{esc(it["title"])}</span><p>{esc(it["description"])}</p></article>"""
        )
    body = "\n".join(articles)
    return f"""    <section class="section unique-points">
      <div class="container">
        <div class="why-eyebrow">{esc(u["eyebrow"])}</div>
        <h2 class="section-title section-title-secondary">{esc(u["headline"])}</h2>
        <div class="unique-grid">
{body}
        </div>
      </div>
    </section>
"""


def _stat_label_html(label: str) -> str:
    """Allow multi-line labels: use \\n in JSON for a line break in the subtitle under the stat value."""
    return "<br />".join(esc(part) for part in label.split("\n"))


def render_stats(home: dict[str, Any], ctx: dict[str, str]) -> str:
    sb = home["statsBar"]
    sv = home["statsValues"]
    rows = []
    for it in sb["items"]:
        val = sv[it["valueKey"]]
        rows.append(
            f'        <div><strong>{esc(val)}</strong><span>{_stat_label_html(it["label"])}</span></div>'
        )
    return f"""    <section class="stats-thin" aria-label="{esc(sb["ariaLabel"], quote=True)}">
      <div class="container stats-thin-grid">
{chr(10).join(rows)}
      </div>
    </section>
"""


def render_contact_banner(home: dict[str, Any], ctx: dict[str, str]) -> str:
    c = home["contactBanner"]
    return f"""    <section class="section contact-banner-split">
      <div class="container contact-banner-grid">
        <div class="contact-banner-copy">
          <h2 class="section-title">{esc(c["headline"])}</h2>
          <p class="section-lead">{esc(c["paragraph1"])}</p>
          <p class="section-lead">{esc(c["paragraph2"])}</p>
          <div class="contact-banner-actions">
            <a href="tel:{esc(ctx["phoneTel"], quote=True)}" class="contact-banner-phone">
              <img src="{esc(c["phoneIconSrc"], quote=True)}" alt="" aria-hidden="true">
              <span class="contact-banner-phone-number">{esc(ctx["phoneDisplay"])}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
"""


def render_reviews(home: dict[str, Any], ctx: dict[str, str]) -> str:
    r = home["reviews"]
    sm = r["summary"]
    rv = r["reviewValues"]
    rating = rv[sm["ratingValueKey"]]
    count = rv[sm["reviewCountKey"]]

    blocks = []
    for t in r["testimonials"]:
        quoted = esc('"' + t["quote"] + '"')
        blocks.append(
            f"""          <blockquote class="testimonial">
            <div class="review-brand review-brand-top">
              <img src="{esc(t["avatarSrc"], quote=True)}" alt="{esc(t["author"], quote=True)}" class="review-avatar">
              <div class="review-meta">
                <strong>{esc(t["author"])}</strong>
                <span class="review-time">{esc(t["timeAgo"])}</span>
              </div>
            </div>
            <img src="{esc(sm["starsImageSrc"], quote=True)}" alt="{esc(sm["starsImageAlt"], quote=True)}" class="review-stars">
            <p>{quoted}</p>
            <div class="review-posted-on">
              <img src="{esc(sm["googleIconSrc"], quote=True)}" alt="Google" class="google-logo">
              <span>{esc(r["postedOnLabel"])}</span>
            </div>
          </blockquote>"""
        )

    return f"""    <section id="reviews" class="section google-reviews">
      <div class="container">
        <h2 class="section-title reviews-title">{esc(r["headline"])}</h2>
        <div class="reviews-summary">
          <div class="reviews-summary-left">
            <p class="reviews-summary-brand">
              <img src="{esc(sm["googleIconSrc"], quote=True)}" alt="Google" class="google-logo">
              <span>{esc(sm["brandLabel"])}</span>
            </p>
            <p class="reviews-summary-rating">
              <strong>{esc(rating)}</strong>
              <img src="{esc(sm["starsImageSrc"], quote=True)}" alt="{esc(sm["starsImageAlt"], quote=True)}" class="review-stars review-stars-inline">
              <span>{esc(sm["reviewCountPrefix"])}{esc(count)}{esc(sm["reviewCountSuffix"])}</span>
            </p>
          </div>
          <a href="{esc(sm["ctaHref"], quote=True)}" class="btn btn-primary reviews-summary-cta">{esc(sm["ctaText"])}</a>
        </div>
        <div class="testimonials-grid">
{chr(10).join(blocks)}
        </div>
      </div>
    </section>
"""


def render_service_area(home: dict[str, Any], ctx: dict[str, str]) -> str:
    sa = home["serviceArea"]
    title = sub_ctx(sa["mapIframeTitleTemplate"], ctx)
    city_links = "\n              ".join(
        f'<a href="{esc(c["href"], quote=True)}">{esc(c["name"])}</a>' for c in sa["cities"]
    )
    return f"""    <section id="service-area" class="section service-area">
      <div class="container">
        <div class="why-eyebrow">{esc(sa["eyebrow"])}</div>
        <h2 class="section-title">{esc(sa["headline"])}</h2>
        <p class="section-lead service-area-intro">{esc(sa["intro"])}</p>
        <div class="service-area-grid">
          <div class="map-wrap">
            <iframe src="{esc(ctx["mapEmbedUrl"], quote=True)}" width="600" height="400" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="{esc(title, quote=True)}"></iframe>
          </div>
          <div class="cities-list">
            <p class="cities-label">{esc(sa["citiesLabel"])}</p>
            <nav class="cities-nav" aria-label="{esc(sa["citiesNavAriaLabel"], quote=True)}">
              {city_links}
            </nav>
          </div>
        </div>
      </div>
    </section>
"""


def render_team(home: dict[str, Any], _ctx: dict[str, str]) -> str:
    t = home["team"]
    cards = []
    for m in t["members"]:
        cards.append(
            f"""          <article class="team-card"><img src="{esc(m["imageSrc"], quote=True)}" alt="{esc(m["imageAlt"], quote=True)}"><h3>{esc(m["name"])}</h3><p>{esc(m["bio"])}</p></article>"""
        )
    return f"""    <section id="team" class="section our-team">
      <div class="container">
        <h2 class="section-title">{esc(t["headline"])}</h2>
        <div class="team-grid">
{chr(10).join(cards)}
        </div>
      </div>
    </section>
"""


def render_faq(home: dict[str, Any], _ctx: dict[str, str]) -> str:
    f = home["faq"]
    items = []
    for i, item in enumerate(f["items"], start=1):
        items.append(
            f"""            <div class="faq-item">
              <button type="button" class="faq-summary" id="faq-btn-{i}" aria-expanded="false" aria-controls="faq-panel-{i}">
                <span class="faq-question">{esc(item["question"])}</span>
                <span class="faq-chevron" aria-hidden="true"></span>
              </button>
              <div class="faq-answer-outer" id="faq-panel-{i}" role="region" aria-labelledby="faq-btn-{i}" aria-hidden="true">
                <div class="faq-answer">
                  {item["answerHtml"]}
                </div>
              </div>
            </div>"""
        )
    return f"""    <section id="faq" class="section faq-section" aria-labelledby="{esc(f["headingId"], quote=True)}">
      <div class="container">
        <div class="faq-panel">
        <h2 class="section-title section-title-secondary" id="{esc(f["headingId"], quote=True)}">{esc(f["headline"])}</h2>
        <div class="faq-list" data-faq-accordion>
{chr(10).join(items)}
        </div>
        </div>
      </div>
    </section>
"""


def render_footer(home: dict[str, Any], ctx: dict[str, str]) -> str:
    fe = home["footerEstimate"]
    fb = home["footerBrand"]
    ff = fe["formFields"]
    b = home["business"]
    cols = home["footerColumns"]
    fs = home["footerSupport"]

    # Social SVGs — keyed by JSON `platform` (see footerBrand.socialLinks)
    social_svg_templates: dict[str, str] = {
        "Facebook": """            <a href="{href}" aria-label="{label}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.4V11H7.8v3h2.4v8h3.3z"/></svg>
            </a>""",
        "Instagram": """            <a href="{href}" aria-label="{label}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2zm0 1.8A3.4 3.4 0 0 0 3.8 7.2v9.6a3.4 3.4 0 0 0 3.4 3.4h9.6a3.4 3.4 0 0 0 3.4-3.4V7.2a3.4 3.4 0 0 0-3.4-3.4H7.2zm10 1.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z"/></svg>
            </a>""",
        "Google Business Profile": """            <a href="{href}" aria-label="{label}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6.2c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.4-5 3.4-8.2z"/><path fill="currentColor" d="M12 23c3.1 0 5.7-1 7.6-2.7l-3.7-2.8c-1 .7-2.3 1.1-3.9 1.1-3 0-5.6-2-6.5-4.8H1.7V16C3.6 20.1 7.4 23 12 23z"/><path fill="currentColor" d="M5.5 13.8A6.8 6.8 0 0 1 5.1 12c0-.6.1-1.3.4-1.8V7.4H1.7A11 11 0 0 0 1 12c0 1.8.4 3.5 1.1 5l3.4-3.2z"/><path fill="currentColor" d="M12 5.3c1.7 0 3.2.6 4.3 1.7l3.2-3.2C17.6 2 15 1 12 1 7.4 1 3.6 3.9 1.7 8l3.8 2.2c.9-2.8 3.5-4.9 6.5-4.9z"/></svg>
            </a>""",
        "Twitter": """            <a href="{href}" aria-label="{label}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>""",
        "LinkedIn": """            <a href="{href}" aria-label="{label}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.062 2.062 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>""",
        "Yelp": """            <a href="{href}" aria-label="{label}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
            </a>""",
    }
    default_social_svg = """            <a href="{href}" aria-label="{label}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h2.5A2.5 2.5 0 0 1 19 5.5V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5A2.5 2.5 0 0 1 7.5 3H10a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V4a1 1 0 0 1 1-1z"/></svg>
            </a>"""
    social_html = "\n".join(
        social_svg_templates.get(s["platform"], default_social_svg).format(
            href=esc(s["href"], quote=True),
            label=esc(s["ariaLabel"], quote=True),
        )
        for s in fb["socialLinks"]
    )

    col0 = cols[0]
    col1 = cols[1]
    col2 = cols[2]

    s_links = "\n            ".join(
        f'<a href="{esc(l["href"], quote=True)}">{esc(l["label"])}</a>' for l in col0["links"]
    )
    c_links = "\n            ".join(
        f'<a href="{esc(l["href"], quote=True)}">{esc(l["label"])}</a>' for l in col1["links"]
    )

    sup_links = []
    for link in fs["links"]:
        if link.get("target"):
            sup_links.append(
                f'<a href="{esc(link["href"], quote=True)}" target="{esc(link["target"], quote=True)}" rel="{esc(link.get("rel", ""), quote=True)}">{esc(link["label"])}</a>'
            )
        else:
            sup_links.append(f'<a href="{esc(link["href"], quote=True)}">{esc(link["label"])}</a>')
    sup_nav = "\n        ".join(sup_links)

    copyright_href = esc(b["copyrightSiteUrl"], quote=True)

    return f"""  <!-- Estimate / schedule CTAs site-wide: link to #contact (copy this footer on every page). -->
  <footer class="footer">
    <section id="contact" class="section contact footer-estimate" aria-labelledby="footer-estimate-heading">
      <div class="container">
        <div class="contact-wrapper">
          <div class="contact-info">
            <h2 class="section-title" id="footer-estimate-heading">{esc(fe["headline"])}</h2>
            <p>{esc(fe["intro"])}</p>
            <div class="contact-details">
              <a href="tel:{esc(ctx["phoneTel"], quote=True)}">{esc(ctx["phoneDisplay"])}</a>
              <a href="mailto:{esc(ctx["email"], quote=True)}">{esc(ctx["email"])}</a>
              <p class="contact-address">{esc(ctx["addressShort"])}</p>
            </div>
          </div>
          <form class="contact-form" data-lead-form="footer" action="{esc(fe["formAction"], quote=True)}" method="{esc(fe["formMethod"], quote=True)}">
            <div class="contact-form-grid">
              <div class="contact-form-field">
                <label for="contact-name">{esc(ff["nameLabel"])} <span class="required-mark" aria-hidden="true">*</span></label>
                <input type="text" id="contact-name" name="name" required autocomplete="name">
              </div>
              <div class="contact-form-field">
                <label for="contact-email">{esc(ff["emailLabel"])} <span class="required-mark" aria-hidden="true">*</span></label>
                <input type="email" id="contact-email" name="email" required autocomplete="email">
              </div>
              <div class="contact-form-field">
                <label for="contact-phone">{esc(ff["phoneLabel"])} <span class="required-mark" aria-hidden="true">*</span></label>
                <input type="tel" id="contact-phone" name="phone" required autocomplete="tel">
              </div>
              <div class="contact-form-field">
                <label for="contact-location">{esc(ff["cityLabel"])}</label>
                <input type="text" id="contact-location" name="location" autocomplete="address-level2">
              </div>
              <div class="contact-form-field contact-form-field-full">
                <label for="contact-message">{esc(ff["projectDetailsLabel"])}</label>
                <textarea id="contact-message" name="message" rows="4"></textarea>
              </div>
            </div>
            <div class="lead-form-honeypot-wrap" aria-hidden="true">
              <label for="contact-website">Leave blank</label>
              <input type="text" id="contact-website" name="website" tabindex="-1" autocomplete="off">
            </div>
            <p class="lead-form-status" data-lead-form-status role="status" aria-live="polite"></p>
            <button type="submit" class="btn btn-primary btn-lg">{esc(ff["submitButton"])}</button>
          </form>
        </div>
      </div>
    </section>
    <div class="container">
      <div class="footer-inner">
        <div class="footer-brand-block footer-col">
          <img src="{esc(ctx["logoHorizontalWhite"], quote=True)}" alt="{esc(ctx["companyName"], quote=True)}" class="footer-logo">
          <p class="footer-address">{esc(fb["tagline"])}</p>
          <div class="footer-social" aria-label="{esc(fb["socialAriaLabel"], quote=True)}">
{social_html}
          </div>
        </div>
        <div class="footer-col">
          <p class="footer-heading">{esc(col0["heading"])}</p>
          <nav class="footer-links" aria-label="{esc(col0["ariaLabel"], quote=True)}">
            {s_links}
          </nav>
        </div>
        <div class="footer-col">
          <p class="footer-heading">{esc(col1["heading"])}</p>
          <nav class="footer-links" aria-label="{esc(col1["ariaLabel"], quote=True)}">
            {c_links}
          </nav>
        </div>
        <div class="footer-col">
          <p class="footer-heading">{esc(col2["heading"])}</p>
          <div class="footer-links footer-contact-list">
            <a href="tel:{esc(ctx["phoneTel"], quote=True)}" class="footer-contact-item"><span class="footer-item-icon" aria-hidden="true">☎</span><span>{esc(ctx["phoneDisplay"])}</span></a>
            <a href="mailto:{esc(ctx["email"], quote=True)}" class="footer-contact-item"><span class="footer-item-icon" aria-hidden="true">✉</span><span>{esc(ctx["email"])}</span></a>
            <p class="footer-address footer-contact-item"><span class="footer-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24" class="footer-item-icon-svg"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Zm0-9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="currentColor"/></svg></span><span>{esc(ctx["addressMetro"])}</span></p>
          </div>
          <p class="footer-heading footer-hours-heading">{esc(col2["hoursHeading"])}</p>
          <p class="footer-hours footer-contact-item"><span class="footer-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24" class="footer-item-icon-svg"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 10.4 3 1.8-1 1.7-4-2.4V7h2Z" fill="currentColor"/></svg></span><span>{esc(col2["hoursText"])}</span></p>
        </div>
      </div>
    </div>
  </footer>

  <div class="footer-support">
    <div class="container footer-support-inner">
      <p><a href="{copyright_href}">© <span id="year"></span> — {esc(ctx["companyName"])}</a></p>
      <nav aria-label="{esc(fs["ariaLabel"], quote=True)}">
        {sup_nav}
      </nav>
    </div>
  </div>
"""


def render_typed_config(home: dict[str, Any], _ctx: dict[str, str]) -> str:
    phrases = home["hero"]["typedPhrases"]
    return (
        '  <script type="application/json" id="homepage-typed-phrases">'
        + json.dumps(phrases, ensure_ascii=False)
        + "</script>\n"
    )


RENDERERS = {
    "header": render_header,
    "hero": render_hero,
    "projects": render_projects,
    "why-choose": render_why_choose,
    "services": render_services,
    "about": render_about,
    "unique-points": render_unique_points,
    "stats": render_stats,
    "contact-banner": render_contact_banner,
    "reviews": render_reviews,
    "service-area": render_service_area,
    "team": render_team,
    "faq": render_faq,
    "footer": render_footer,
    "typed-config": render_typed_config,
}


def inject_homepage_sections(html: str, home: dict[str, Any]) -> str:
    ctx = build_flat_context(home)
    pat = re.compile(r"<!--\s*@homepage:([\w-]+)\s*-->")

    def repl(m: re.Match[str]) -> str:
        name = m.group(1)
        if name not in RENDERERS:
            raise SystemExit(f"Unknown @homepage:{name}")
        fn = RENDERERS[name]
        return fn(home, ctx)

    return pat.sub(repl, html)
