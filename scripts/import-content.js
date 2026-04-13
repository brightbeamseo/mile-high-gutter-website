import 'dotenv/config';
/**
 * Import shared/homepage-content.json into Sanity as singleton documents:
 *   siteSettings (id: siteSettingsSingleton)
 *   homePage    (id: homePageSingleton)
 *
 * Uses createOrReplace only (see lib/sanity-write.js). Every array item gets a
 * unique _key (see lib/sanity-array-keys.js).
 *
 * Requires env: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN
 * (optional SANITY_API_VERSION). See .env.example.
 *
 * Run from repo root: node scripts/import-content.js
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { addKeysToSanityArrays } from '../lib/sanity-array-keys.js';
import { getSanityWriteClient, stripSanitySystemFields, upsertDocument } from '../lib/sanity-write.js';

/** Fixed _id values (writable singletons; avoids read-only draft/system ids). */
export const SITE_SETTINGS_DOCUMENT_ID = 'siteSettingsSingleton';
export const HOME_PAGE_DOCUMENT_ID = 'homePageSingleton';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_PATH = join(ROOT, 'shared', 'homepage-content.json');

/** `businessCategories` / `keywords` use schema type `stringListItem` ({ value }) — not plain string[]. */
function stringListFromJson(arr) {
  if (!Array.isArray(arr)) return undefined;
  return arr.map((item) =>
    typeof item === 'string'
      ? { _type: 'stringListItem', value: item }
      : item,
  );
}

/** Document fields for siteSettings (Sanity schema: siteSettings.ts) */
function buildSiteSettingsData(json) {
  return {
    ...(json.header ? { header: json.header } : {}),
    business: json.business,
    businessCategories: stringListFromJson(json.businessCategories),
    keywords: stringListFromJson(json.keywords),
    businessListings: json.businessListings,
    forms: json.forms
      ? {
          submitPath: json.forms.submitPath,
          formKicker: json.forms.formKicker,
          formAriaLabel: json.forms.formAriaLabel,
          requiredIndicator: json.forms.requiredIndicator,
        }
      : undefined,
    meta: json.meta,
    theme: json.theme,
    statsValues: json.statsValues,
    mapEmbedUrl: json.mapEmbedUrl,
  };
}

/**
 * All homepage section keys (Sanity schema: homePage.ts).
 * Excludes globals that live on siteSettings and `forms` (not in schema).
 */
const HOME_PAGE_KEYS = [
  'page',
  'layoutBackgrounds',
  'header',
  'hero',
  'brandsMarquee',
  'projects',
  'whyChoose',
  'services',
  'about',
  'uniquePoints',
  'statsBar',
  'contactBanner',
  'reviews',
  'serviceArea',
  'team',
  'faq',
  'footerEstimate',
  'footerBrand',
  'footerColumns',
  'footerSupport',
];

function buildHomePageData(json) {
  const homePageData = {};
  for (const key of HOME_PAGE_KEYS) {
    if (json[key] !== undefined) {
      homePageData[key] = json[key];
    }
  }
  return homePageData;
}

async function main() {
  const raw = readFileSync(CONTENT_PATH, 'utf8');
  const json = JSON.parse(raw);

  const client = getSanityWriteClient();
  const [existingSettings, existingHome] = await Promise.all([
    client.getDocument(SITE_SETTINGS_DOCUMENT_ID).catch(() => null),
    client.getDocument(HOME_PAGE_DOCUMENT_ID).catch(() => null),
  ]);

  const settingsData = addKeysToSanityArrays(buildSiteSettingsData(json));
  const homePageData = addKeysToSanityArrays(buildHomePageData(json));

  const siteDoc = await upsertDocument(
    SITE_SETTINGS_DOCUMENT_ID,
    'siteSettings',
    { ...stripSanitySystemFields(existingSettings), ...settingsData },
  );
  const homeDoc = await upsertDocument(
    HOME_PAGE_DOCUMENT_ID,
    'homePage',
    { ...stripSanitySystemFields(existingHome), ...homePageData },
  );

  console.log('Sanity import OK (createOrReplace)');
  console.log('  siteSettings →', siteDoc._id, `(_type: ${siteDoc._type})`);
  console.log('  homePage →', homeDoc._id, `(_type: ${homeDoc._type})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
