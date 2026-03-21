/**
 * CANONICAL lead API — Vercel `/api/lead`. After edits, run `npm run sync-api` (copies to `astro-site/api/`).
 *
 * Vercel Serverless (Node): verify reCAPTCHA v3, forward to Zapier.
 * Env: ZAPIER_WEBHOOK_URL, RECAPTCHA_SECRET_KEY, optional RECAPTCHA_MIN_SCORE
 */

const RECAPTCHA_VERIFY = 'https://www.google.com/recaptcha/api/siteverify';

function jsonResponse(data, status, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405, {
        Allow: 'POST, OPTIONS',
      });
    }

    const webhook = process.env.ZAPIER_WEBHOOK_URL;
    if (!webhook || !/^https:\/\//i.test(webhook)) {
      return jsonResponse({ ok: false, error: 'server_misconfigured' }, 503);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
    }

    if (!body || typeof body !== 'object') {
      return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
    }

    const hp = body.website != null ? String(body.website).trim() : '';
    if (hp.length > 0) {
      return jsonResponse({ ok: true }, 200);
    }

    const name = String(body.name || '').trim().slice(0, 500);
    const email = String(body.email || '').trim().slice(0, 320);
    const phone = String(body.phone || '').trim().slice(0, 80);
    const location = String(body.location || '').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 5000);
    const formSource = String(body.formSource || 'unknown').trim().slice(0, 80);
    const pageUrl = String(body.pageUrl || '').trim().slice(0, 2000);
    const recaptchaToken =
      typeof body.recaptchaToken === 'string' ? body.recaptchaToken.trim() : '';

    if (!name || !email || !phone) {
      return jsonResponse({ ok: false, error: 'missing_fields' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const minScore = Math.min(
      1,
      Math.max(0, parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.35') || 0.35)
    );

    if (secret) {
      if (!recaptchaToken) {
        return jsonResponse({ ok: false, error: 'recaptcha_required' }, 400);
      }
      const verifyRes = await fetch(RECAPTCHA_VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: recaptchaToken }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyData.success) {
        return jsonResponse({ ok: false, error: 'recaptcha_failed' }, 400);
      }
      if (typeof verifyData.score === 'number' && verifyData.score < minScore) {
        return jsonResponse({ ok: false, error: 'recaptcha_low_score' }, 400);
      }
    }

    const payload = {
      formSource,
      name,
      email,
      phone,
      location,
      message,
      submittedAt: new Date().toISOString(),
      pageUrl,
    };

    let zRes;
    try {
      zRes = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      return jsonResponse({ ok: false, error: 'upstream_unreachable' }, 502);
    }

    if (!zRes.ok) {
      return jsonResponse({ ok: false, error: 'upstream_error' }, 502);
    }

    return jsonResponse({ ok: true }, 200);
  },
};
