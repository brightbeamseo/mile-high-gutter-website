/**
 * Sanity write client for Node scripts and automation (e.g. AI updates).
 * Requires a token with write access. Never expose the token to the browser.
 */
import { createClient } from '@sanity/client';

function requireEnv(name) {
  const value = process.env[name];
  if (value == null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

/** @type {import('@sanity/client').SanityClient | null} */
let _client = null;

/**
 * Singleton Sanity client configured from env (useCdn: false for mutations).
 * Env: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN;
 * optional SANITY_API_VERSION (default `2024-01-01`).
 */
export function getSanityWriteClient() {
  if (!_client) {
    _client = createClient({
      projectId: requireEnv('SANITY_PROJECT_ID'),
      dataset: requireEnv('SANITY_DATASET'),
      apiVersion: process.env.SANITY_API_VERSION?.trim() || '2024-01-01',
      token: requireEnv('SANITY_API_TOKEN'),
      useCdn: false,
    });
  }
  return _client;
}

/**
 * Create or fully replace a document by id (same as Sanity dashboard “replace”).
 * @param {string} id Document _id (fixed id for singletons, or draft id, etc.)
 * @param {string} type Sanity schema _type
 * @param {Record<string, unknown>} [data] Fields to store (must not rely on merging with existing doc)
 * @returns {Promise<import('@sanity/client').SanityDocument>}
 */
export async function upsertDocument(id, type, data = {}) {
  if (id == null || String(id).trim() === '') {
    throw new Error('upsertDocument: id is required');
  }
  if (type == null || String(type).trim() === '') {
    throw new Error('upsertDocument: type is required');
  }

  const client = getSanityWriteClient();
  const doc = {
    ...data,
    _id: String(id).trim(),
    _type: String(type).trim(),
  };

  // Full document replace only (no patch). String arrays stay plain strings (no auto key wrapping).
  return client.createOrReplace(doc);
}
