# Site-wide footer & estimates

- **Main estimate form** lives in the footer: `<section id="contact" class="section contact footer-estimate">…</section>`.
- **All “schedule / free estimate / request estimate” CTAs** should use `href="#contact"` so they scroll to that form on any page.
- When you add new HTML pages, **copy the same `<footer>…</footer>` and `footer-support` block** from `index.html` so `#contact` always exists.
