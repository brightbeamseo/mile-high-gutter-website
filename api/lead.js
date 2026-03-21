/**
 * Vercel Serverless: verify reCAPTCHA v3 (secret stays server-side), forward to Zapier.
 *
 * Env (Vercel → Settings → Environment Variables):
 *   ZAPIER_WEBHOOK_URL   — required (Catch Hook “Custom” POST URL)
 *   RECAPTCHA_SECRET_KEY — optional in dev; in production set with your v3 secret
 *   RECAPTCHA_MIN_SCORE  — optional, default 0.35 (0.0–1.0, higher = stricter)
 */

const RECAPTCHA_VERIFY = 'https://www.google.com/recaptcha/api/siteverify';

function parseBody(req) {
  const raw = req.body;
  if (raw == null || raw === '') return {};
  if (Buffer.isBuffer(raw)) {
    try {
      return JSON.parse(raw.toString('utf8'));
    } catch {
      return null;
    }
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof raw === 'object') return raw;
  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const webhook = process.env.ZAPIER_WEBHOOK_URL;
  if (!webhook || !/^https:\/\//i.test(webhook)) {
    return res.status(503).json({ ok: false, error: 'server_misconfigured' });
  }

  const body = parseBody(req);
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false, error: 'invalid_json' });
  }

  // Honeypot — leave empty in real browsers; bots often fill hidden fields.
  const hp = body.website != null ? String(body.website).trim() : '';
  if (hp.length > 0) {
    return res.status(200).json({ ok: true });
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
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const minScore = Math.min(
    1,
    Math.max(0, parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.35') || 0.35)
  );

  if (secret) {
    if (!recaptchaToken) {
      return res.status(400).json({ ok: false, error: 'recaptcha_required' });
    }
    const verifyRes = await fetch(RECAPTCHA_VERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: recaptchaToken }),
    });
    const verifyData = await verifyRes.json().catch(() => ({}));
    if (!verifyData.success) {
      return res.status(400).json({ ok: false, error: 'recaptcha_failed' });
    }
    if (typeof verifyData.score === 'number' && verifyData.score < minScore) {
      return res.status(400).json({ ok: false, error: 'recaptcha_low_score' });
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
    return res.status(502).json({ ok: false, error: 'upstream_unreachable' });
  }

  if (!zRes.ok) {
    return res.status(502).json({ ok: false, error: 'upstream_error' });
  }

  return res.status(200).json({ ok: true });
};
