/**
 * CANONICAL lead API — Vercel `/api/lead`. After edits, run `npm run sync-api` (copies to `astro-site/api/`).
 *
 * Forwards JSON to Zapier. reCAPTCHA disabled — add back later if needed.
 *
 * Env: ZAPIER_WEBHOOK_URL (required, https)
 */

/** Visitor-submitted phone from forms → NNN-NNN-NNNN when US 10 digits. */
function formatUsPhoneDashes(value) {
  const d = String(value || '').replace(/\D/g, '');
  let n = d;
  if (d.length === 11 && d.startsWith('1')) n = d.slice(1);
  if (n.length === 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
  return String(value || '').trim();
}

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

    const webhook = (process.env.ZAPIER_WEBHOOK_URL || '').trim();
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
    const phone = formatUsPhoneDashes(body.phone || '').slice(0, 80);
    const location = String(body.location || '').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 5000);
    const formSource = String(body.formSource || 'unknown').trim().slice(0, 80);
    const pageUrl = String(body.pageUrl || '').trim().slice(0, 2000);

    if (!name || !email || !phone) {
      return jsonResponse({ ok: false, error: 'missing_fields' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
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
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'MHG-Lead-Form/1.0 (Vercel)',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      return jsonResponse({ ok: false, error: 'upstream_unreachable' }, 502);
    }

    if (!zRes.ok) {
      return jsonResponse(
        {
          ok: false,
          error: 'upstream_error',
          zapierStatus: zRes.status,
        },
        502
      );
    }

    return jsonResponse({ ok: true }, 200);
  },
};
