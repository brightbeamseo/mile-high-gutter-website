(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // External http(s) links: always open in a new tab (same-site / relative / # / mailto / tel unchanged)
  (function normalizeExternalLinks() {
    var originHost = window.location.hostname;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || !href.trim()) return;
      var trimmed = href.trim();
      if (trimmed.charAt(0) === '#' || trimmed.charAt(0) === '?') return;
      if (trimmed.indexOf('/') === 0 && trimmed.indexOf('//') !== 0) return;
      if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return;
      if (/^javascript:/i.test(trimmed)) return;
      var url;
      try {
        url = new URL(trimmed, window.location.href);
      } catch (e) {
        return;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.hostname === originHost) return;
      a.setAttribute('target', '_blank');
      var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (rel.indexOf('noopener') === -1) rel.push('noopener');
      if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });
  })();

  // Smooth anchor scroll with sticky-header offset
  function getHeaderOffset() {
    var header = document.querySelector('.header');
    return header ? header.offsetHeight : 0;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      var targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') {
        return;
      }

      var targetEl = document.querySelector(targetId);
      if (!targetEl) {
        return;
      }

      event.preventDefault();
      var offset = getHeaderOffset() + 8;
      var targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  // Section/card entry animations — homepage only (body.home-reveal-animate)
  /* Exclude .stats-thin and .unique-points: transform-based reveal causes 1px white hairlines between full-bleed sections.
     Exclude .projects-gallery-section: it contains position:fixed lightbox; any ancestor transform breaks fixed positioning. */
  var revealTargets = [];
  if (document.body && document.body.classList.contains('home-reveal-animate')) {
    revealTargets = Array.prototype.slice.call(
      document.querySelectorAll(
        'main > section:not(.stats-thin, .unique-points, .projects-gallery-section), footer > section, .service-card, .result-item, .testimonial, .team-card, .faq-item'
      )
    );
  }

  if (revealTargets.length) {
    revealTargets.forEach(function (el, index) {
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = Math.min((index % 8) * 60, 300) + 'ms';
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach(function (el) {
        el.classList.add('is-visible');
        el.style.transitionDelay = '0ms';
      });
    } else {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      revealTargets.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  var mobileBreakpoint = window.matchMedia('(max-width: 1120px)');

  if (navToggle && nav) {
    navToggle.setAttribute('aria-expanded', 'false');

    function closeMobileNav() {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-label', 'Open menu');
      navToggle.setAttribute('aria-expanded', 'false');
      nav.querySelectorAll('[data-nav-dropdown]').forEach(function (dd) {
        dd.classList.remove('is-open');
        var t = dd.querySelector('.nav-dropdown-toggle');
        if (t) {
          t.setAttribute('aria-expanded', 'false');
        }
      });
    }

    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      var isOpen = nav.classList.contains('is-open');
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Mobile: tap Services / About to expand submenus (desktop uses hover)
    nav.querySelectorAll('[data-nav-dropdown]').forEach(function (dropdown) {
      var toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', function (e) {
        if (!mobileBreakpoint.matches) {
          return;
        }
        e.stopPropagation();
        var opening = !dropdown.classList.contains('is-open');
        nav.querySelectorAll('[data-nav-dropdown]').forEach(function (other) {
          if (other !== dropdown) {
            other.classList.remove('is-open');
            var ot = other.querySelector('.nav-dropdown-toggle');
            if (ot) ot.setAttribute('aria-expanded', 'false');
          }
        });
        dropdown.classList.toggle('is-open', opening);
        toggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
      });
    });

    // Close nav when a link is clicked (for anchor links)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileNav();
      });
    });

    // Close mobile nav when switching to desktop layout
    function handleViewportChange() {
      if (!mobileBreakpoint.matches) {
        closeMobileNav();
      }
    }

    if (mobileBreakpoint.addEventListener) {
      mobileBreakpoint.addEventListener('change', handleViewportChange);
    } else if (mobileBreakpoint.addListener) {
      mobileBreakpoint.addListener(handleViewportChange);
    }

    // Escape key closes the open mobile nav
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMobileNav();
      }
    });
  }

  // Projects carousel controls
  var projectsCarousel = document.getElementById('projects-carousel');
  var prevBtn = document.getElementById('projects-prev');
  var nextBtn = document.getElementById('projects-next');

  if (projectsCarousel && prevBtn && nextBtn) {
    var slides = Array.prototype.slice.call(projectsCarousel.querySelectorAll('.project-slide'));
    var activeIndex = 0;
    var dragStartX = null;
    var dragDeltaX = 0;
    var didDrag = false;
    var suppressNextClick = false;

    function applySliderState() {
      slides.forEach(function (slide) {
        slide.classList.remove('project-prev', 'project-active', 'project-next');
      });

      var prevIndex = (activeIndex - 1 + slides.length) % slides.length;
      var nextIndex = (activeIndex + 1) % slides.length;

      slides[prevIndex].classList.add('project-prev');
      slides[activeIndex].classList.add('project-active');
      slides[nextIndex].classList.add('project-next');
    }

    prevBtn.addEventListener('click', function () {
      activeIndex = (activeIndex - 1 + slides.length) % slides.length;
      applySliderState();
    });

    nextBtn.addEventListener('click', function () {
      activeIndex = (activeIndex + 1) % slides.length;
      applySliderState();
    });

    projectsCarousel.addEventListener('click', function (event) {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }

      var clickedSlide = event.target.closest('.project-slide');
      if (clickedSlide && clickedSlide.classList.contains('project-prev')) {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        applySliderState();
        return;
      }

      if (clickedSlide && clickedSlide.classList.contains('project-next')) {
        activeIndex = (activeIndex + 1) % slides.length;
        applySliderState();
        return;
      }

      // Fallback: click left/right side of carousel to move
      var rect = projectsCarousel.getBoundingClientRect();
      var clickX = event.clientX - rect.left;
      var centerX = rect.width / 2;
      var deadZone = rect.width * 0.18;

      if (clickX < centerX - deadZone) {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        applySliderState();
      } else if (clickX > centerX + deadZone) {
        activeIndex = (activeIndex + 1) % slides.length;
        applySliderState();
      }
    });

    function handleDragStart(clientX) {
      dragStartX = clientX;
      dragDeltaX = 0;
      didDrag = false;
    }

    function handleDragMove(clientX) {
      if (dragStartX === null) {
        return;
      }
      dragDeltaX = clientX - dragStartX;
      if (Math.abs(dragDeltaX) > 30) {
        didDrag = true;
      }
    }

    function handleDragEnd() {
      if (dragStartX === null) {
        return;
      }

      var swipeThreshold = 45;
      if (dragDeltaX <= -swipeThreshold) {
        activeIndex = (activeIndex + 1) % slides.length;
        applySliderState();
        suppressNextClick = true;
      } else if (dragDeltaX >= swipeThreshold) {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        applySliderState();
        suppressNextClick = true;
      }

      dragStartX = null;
      dragDeltaX = 0;
      setTimeout(function () {
        didDrag = false;
      }, 0);
    }

    projectsCarousel.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('dragstart', function (event) {
        event.preventDefault();
      });
    });

    projectsCarousel.addEventListener('pointerdown', function (event) {
      handleDragStart(event.clientX);
      if (projectsCarousel.setPointerCapture) {
        projectsCarousel.setPointerCapture(event.pointerId);
      }
    });

    projectsCarousel.addEventListener('pointermove', function (event) {
      handleDragMove(event.clientX);
    });

    projectsCarousel.addEventListener('pointerup', function () {
      handleDragEnd();
    });

    projectsCarousel.addEventListener('pointercancel', function () {
      handleDragEnd();
    });

    applySliderState();
  }

  // FAQ accordion — JS max-height animation (reliable every toggle; native <details> fights CSS height)
  var faqRoot = document.querySelector('[data-faq-accordion]');
  if (faqRoot) {
    var faqItems = Array.prototype.slice.call(faqRoot.querySelectorAll('.faq-item'));

    function faqOuter(item) {
      return item.querySelector('.faq-answer-outer');
    }
    function faqInner(item) {
      return item.querySelector('.faq-answer');
    }
    function faqBtn(item) {
      return item.querySelector('.faq-summary');
    }

    function faqOpen(item) {
      var outer = faqOuter(item);
      var inner = faqInner(item);
      var btn = faqBtn(item);
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      outer.setAttribute('aria-hidden', 'false');

      if (prefersReducedMotion) {
        outer.style.maxHeight = 'none';
        return;
      }

      outer.style.maxHeight = '0px';
      void outer.offsetHeight;
      outer.style.maxHeight = inner.scrollHeight + 'px';

      outer.addEventListener(
        'transitionend',
        function faqOpenEnd(e) {
          if (e.propertyName !== 'max-height') return;
          if (!item.classList.contains('is-open')) return;
          outer.style.maxHeight = 'none';
          outer.removeEventListener('transitionend', faqOpenEnd);
        },
        { once: true }
      );
    }

    function faqClose(item) {
      var outer = faqOuter(item);
      var inner = faqInner(item);
      var btn = faqBtn(item);

      if (!item.classList.contains('is-open')) {
        outer.style.maxHeight = '0px';
        return;
      }

      if (prefersReducedMotion) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        outer.setAttribute('aria-hidden', 'true');
        outer.style.maxHeight = '0px';
        return;
      }

      var h = inner.scrollHeight;
      outer.style.maxHeight = h + 'px';
      void outer.offsetHeight;
      item.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      outer.setAttribute('aria-hidden', 'true');
      requestAnimationFrame(function () {
        outer.style.maxHeight = '0px';
      });
    }

    faqItems.forEach(function (item) {
      faqOuter(item).style.maxHeight = '0px';
    });

    faqItems.forEach(function (item) {
      faqBtn(item).addEventListener('click', function () {
        if (item.classList.contains('is-open')) {
          faqClose(item);
          return;
        }
        faqItems.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            faqClose(other);
          }
        });
        faqOpen(item);
      });
    });

    var faqResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(faqResizeTimer);
      faqResizeTimer = setTimeout(function () {
        faqItems.forEach(function (item) {
          if (!item.classList.contains('is-open')) return;
          var outer = faqOuter(item);
          var inner = faqInner(item);
          if (outer.style.maxHeight === 'none') {
            outer.style.maxHeight = inner.scrollHeight + 'px';
            void outer.offsetHeight;
            outer.style.maxHeight = 'none';
          }
        });
      }, 150);
    });
  }

  // Hero typed service text: phrases from #homepage-typed-phrases (Sanity → Astro JSON)
  var typedEl = document.getElementById('hero-typed-text');
  var phrases = [];
  var typedCfg = document.getElementById('homepage-typed-phrases');
  var typedFallback =
    typedCfg && typedCfg.getAttribute('data-fallback-phrase')
      ? String(typedCfg.getAttribute('data-fallback-phrase')).trim()
      : '';
  if (typedCfg && typedCfg.textContent) {
    try {
      var parsedPhrases = JSON.parse(typedCfg.textContent);
      if (Array.isArray(parsedPhrases) && parsedPhrases.length) {
        phrases = parsedPhrases;
      }
    } catch (e) { /* ignore invalid JSON */ }
  }
  if (typedEl && !prefersReducedMotion && phrases.length) {
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;

    function runTypeCycle() {
      var currentPhrase = phrases[phraseIndex];

      if (!isDeleting) {
        charIndex += 1;
        typedEl.textContent = currentPhrase.slice(0, charIndex);
        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          setTimeout(runTypeCycle, 900);
          return;
        }
      } else {
        charIndex -= 1;
        typedEl.textContent = currentPhrase.slice(0, Math.max(0, charIndex));
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(runTypeCycle, 220);
          return;
        }
      }

      setTimeout(runTypeCycle, isDeleting ? 40 : 85);
    }

    runTypeCycle();
  } else if (typedEl) {
    typedEl.textContent = phrases[0] || typedFallback || '';
  }

  /** Lead-form phone only (not sitewide NAP): US 10-digit / +1 → NNN-NNN-NNNN. */
  function formatUsPhoneDashes(value) {
    var d = String(value || '').replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') {
      d = d.slice(1);
    }
    if (d.length === 10) {
      return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    }
    return String(value || '').trim();
  }

  /** As user types / pastes: US digits only, max 10 → NNN-NNN-NNNN (partial while typing). */
  function formatPhoneInputLive(el) {
    var d = el.value.replace(/\D/g, '');
    if (d.length >= 11 && d.charAt(0) === '1') {
      d = d.slice(1);
    }
    d = d.slice(0, 10);
    var out = '';
    if (d.length <= 3) {
      out = d;
    } else if (d.length <= 6) {
      out = d.slice(0, 3) + '-' + d.slice(3);
    } else {
      out = d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    }
    el.value = out;
  }

  // Lead forms → POST /api/lead (Zapier on server)
  var formsCfgEl = document.getElementById('site-forms-config');
  var leadForms = Array.prototype.slice.call(document.querySelectorAll('form[data-lead-form]'));

  function readFormsConfig() {
    var defaults = { submitPath: '/api/lead', recaptchaSiteKey: '' };
    if (!formsCfgEl || !formsCfgEl.textContent) {
      return defaults;
    }
    try {
      var parsed = JSON.parse(formsCfgEl.textContent);
      if (parsed && typeof parsed === 'object') {
        return {
          submitPath: typeof parsed.submitPath === 'string' && parsed.submitPath ? parsed.submitPath : defaults.submitPath,
          recaptchaSiteKey: typeof parsed.recaptchaSiteKey === 'string' ? parsed.recaptchaSiteKey : ''
        };
      }
    } catch (e) {
      /* keep defaults */
    }
    return defaults;
  }

  function setStatus(form, message, kind) {
    var el = form.querySelector('[data-lead-form-status]');
    if (!el) return;
    el.textContent = message || '';
    el.classList.remove('is-error', 'is-success');
    if (kind === 'error') el.classList.add('is-error');
    if (kind === 'success') el.classList.add('is-success');
  }

  if (leadForms.length) {
    var cfg = readFormsConfig();
    var endpoint = cfg.submitPath.indexOf('/') === 0 ? cfg.submitPath : '/' + cfg.submitPath;
    var recaptchaSiteKey = cfg.recaptchaSiteKey || '';

    leadForms.forEach(function (form) {
      var phoneInput = form.querySelector('input[name="phone"]');
      if (phoneInput) {
        phoneInput.setAttribute('maxlength', '12');
        phoneInput.setAttribute('autocomplete', 'tel');
        phoneInput.addEventListener('input', function () {
          formatPhoneInputLive(phoneInput);
        });
        phoneInput.addEventListener('blur', function () {
          formatPhoneInputLive(phoneInput);
        });
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.classList.add('is-busy');

        setStatus(form, 'Sending…', null);

        var fd = new FormData(form);
        var payload = {
          formSource: form.getAttribute('data-lead-form') || 'unknown',
          name: (fd.get('name') || '').toString().trim(),
          email: (fd.get('email') || '').toString().trim(),
          phone: formatUsPhoneDashes((fd.get('phone') || '').toString()),
          location: (fd.get('location') || '').toString().trim(),
          message: (fd.get('message') || '').toString().trim(),
          website: (fd.get('website') || '').toString().trim(),
          pageUrl: typeof window.location.href === 'string' ? window.location.href : ''
        };

        var runSend = function () {
          fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
          })
            .then(function (res) {
              return res.text().then(function (text) {
                var data = {};
                try {
                  data = text ? JSON.parse(text) : {};
                } catch (e) {
                  data = { error: 'bad_response', parseError: true };
                }
                return { ok: res.ok, status: res.status, data: data || {} };
              });
            })
            .then(function (result) {
              if (submitBtn) submitBtn.classList.remove('is-busy');
              if (result.ok && result.data && result.data.ok) {
                setStatus(form, 'Thanks — we received your message and will be in touch soon.', 'success');
                form.reset();
                window.location.assign('/thank-you/');
                return;
              }
              var err = (result.data && result.data.error) || 'submit_failed';
              var zst = result.data && result.data.zapierStatus;
              var msg =
                err === 'server_misconfigured'
                  ? 'This form is not configured yet. Please call us instead.'
                  : err === 'recaptcha_misconfigured'
                    ? 'This form is missing security configuration. Please call us instead.'
                    : err === 'recaptcha_missing' || err === 'recaptcha_failed'
                      ? 'Security check failed. Please refresh the page and try again.'
                      : err === 'recaptcha_low_score'
                        ? 'We could not verify this submission. Please try again or call us.'
                        : err === 'recaptcha_action_mismatch'
                          ? 'Security check mismatch. Please refresh and try again.'
                          : err === 'recaptcha_unreachable'
                            ? 'Could not verify security. Please try again in a moment.'
                            : err === 'missing_fields'
                              ? 'Please fill in all required fields.'
                              : err === 'invalid_email'
                                ? 'Please enter a valid email address.'
                                : err === 'upstream_unreachable'
                                  ? 'Could not reach the form service. Please try again or call us.'
                                  : err === 'upstream_error'
                                    ? 'The form service rejected the submission (code ' +
                                      (zst || result.status || '?') +
                                      '). Check the Zapier webhook URL in Vercel, or call us.'
                                    : err === 'bad_response' || result.status === 404
                                      ? 'Form endpoint not found (404). Redeploy the site or check Vercel Root Directory / api folder.'
                                      : 'Something went wrong. Please try again or call us.';
              setStatus(form, msg, 'error');
            })
            .catch(function () {
              if (submitBtn) submitBtn.classList.remove('is-busy');
              setStatus(form, 'Network error. Please check your connection and try again.', 'error');
            });
        };

        var startSend = function () {
          if (!recaptchaSiteKey) {
            runSend();
            return;
          }
          if (typeof window.grecaptcha === 'undefined' || !window.grecaptcha.execute) {
            if (submitBtn) submitBtn.classList.remove('is-busy');
            setStatus(form, 'Security check failed to load. Please refresh the page and try again.', 'error');
            return;
          }
          window.grecaptcha.ready(function () {
            window.grecaptcha
              .execute(recaptchaSiteKey, { action: 'lead_form' })
              .then(function (token) {
                payload.recaptchaToken = token;
                runSend();
              })
              .catch(function () {
                if (submitBtn) submitBtn.classList.remove('is-busy');
                setStatus(form, 'Security check failed. Please try again.', 'error');
              });
          });
        };

        startSend();
      });
    });
  }
})();
