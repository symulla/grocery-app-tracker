import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = process.env.OFFERS_OUTPUT_PATH || resolve(rootDir, 'public', 'data', 'current-offers.json');
const refreshMinutes = Math.max(Number(process.env.OFFERS_REFRESH_MINUTES || 60), 15);
const maxOffersPerStore = 12;

const retailers = [
  {
    id: 'carrefour',
    name: 'Carrefour Kenya',
    offersUrl: 'https://www.carrefour.ke/mafken/en/c/ken-todays-deal'
  },
  {
    id: 'naivas',
    name: 'Naivas Online',
    offersUrl: 'https://www.naivas.online/'
  },
  {
    id: 'quickmart',
    name: 'Quickmart',
    offersUrl: 'https://www.quickmart.co.ke/'
  },
  {
    id: 'foodplus',
    name: 'Chandarana Foodplus',
    offersUrl: 'https://www.foodplus.co.ke/'
  }
];

function cleanText(value = '') {
  return String(value)
    .replace(/\\u0026/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsefulProductName(name) {
  const normalized = cleanText(name);
  return normalized.length >= 4
    && normalized.length <= 100
    && !/^(price|offer|add to cart|today|home|shop now|image)$/i.test(normalized)
    && /[a-z]/i.test(normalized);
}

function toPrice(value) {
  const parsed = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function walkJson(value, records) {
  if (Array.isArray(value)) {
    value.forEach((item) => walkJson(item, records));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const type = Array.isArray(value['@type']) ? value['@type'].join(' ') : value['@type'];
  const offers = Array.isArray(value.offers) ? value.offers[0] : value.offers;
  const price = toPrice(offers?.price ?? value.price ?? value.salePrice ?? value.finalPrice);
  const name = cleanText(value.name ?? value.productName ?? value.title);

  if ((/product/i.test(type || '') || price) && isUsefulProductName(name) && price) {
    records.push({ productName: name, price });
  }

  Object.values(value).forEach((child) => walkJson(child, records));
}

function extractOffers(html) {
  const records = [];
  const jsonScripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  for (const match of jsonScripts) {
    try {
      walkJson(JSON.parse(match[1]), records);
    } catch {
      // A malformed JSON-LD block should not stop the remaining retailer sync.
    }
  }

  // Some storefronts expose product data inside JavaScript state instead of JSON-LD.
  const statePattern = /["'](?:name|productName|title)["']\s*:\s*["']([^"']{4,100})["'][\s\S]{0,500}?["'](?:salePrice|finalPrice|price)["']\s*:\s*["']?([0-9][0-9,.]*)/gi;
  for (const match of html.matchAll(statePattern)) {
    const productName = cleanText(match[1]);
    const price = toPrice(match[2]);
    if (isUsefulProductName(productName) && price) records.push({ productName, price });
  }

  const seen = new Set();
  return records
    .filter(({ productName, price }) => {
      const key = `${productName.toLowerCase()}-${price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maxOffersPerStore);
}

async function fetchRetailer(retailer) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(retailer.offersUrl, {
      signal: controller.signal,
      headers: {
        'user-agent': 'HarvestTrackOffersBot/1.0 (+https://example.com/contact)',
        accept: 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const offers = extractOffers(await response.text());
    return {
      ...retailer,
      status: offers.length ? 'ok' : 'no-offers-found',
      notice: offers.length ? null : 'No public item-level offers were found. This store may require a branch or delivery location.',
      offers
    };
  } catch (error) {
    return {
      ...retailer,
      status: 'unavailable',
      notice: `Could not refresh this retailer: ${error.message}`,
      offers: []
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function readPreviousFeed() {
  try {
    return JSON.parse(await readFile(outputPath, 'utf8'));
  } catch {
    return null;
  }
}

async function writeFeed(feed) {
  await mkdir(dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(feed, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, outputPath);
}

export async function syncOffers() {
  const previousFeed = await readPreviousFeed();
  const stores = await Promise.all(retailers.map(fetchRetailer));
  const hasFreshOffers = stores.some((store) => store.offers.length > 0);

  // Preserve the last successful offers during a temporary network outage.
  const previousStores = new Map((previousFeed?.stores || []).map((store) => [store.id, store]));
  const safeStores = stores.map((store) => {
    if (store.status !== 'unavailable') return store;
    const previous = previousStores.get(store.id);
    return previous?.offers?.length ? { ...store, offers: previous.offers, stale: true } : store;
  });

  const feed = {
    syncedAt: new Date().toISOString(),
    refreshMinutes,
    hasFreshOffers,
    stores: safeStores
  };

  await writeFeed(feed);
  console.log(`Offers synced: ${safeStores.reduce((total, store) => total + store.offers.length, 0)} offers written to ${outputPath}`);
  return feed;
}

if (process.argv.includes('--watch')) {
  await syncOffers();
  setInterval(() => syncOffers().catch((error) => console.error('Offer sync failed:', error)), refreshMinutes * 60_000);
  console.log(`Offer sync worker is running every ${refreshMinutes} minutes.`);
} else {
  await syncOffers();
}
