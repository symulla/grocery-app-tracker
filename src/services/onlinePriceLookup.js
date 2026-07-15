const STORES = [
  {
    supermarket: 'Carrefour',
    url: (query) => `https://www.carrefour.ke/mafken/en/search?text=${encodeURIComponent(query)}`
  },
  {
    supermarket: 'Naivas',
    url: (query) => `https://www.naivas.online/search?term=${encodeURIComponent(query)}`
  },
  {
    supermarket: 'Quickmart',
    url: (query) => `https://www.quickmart.co.ke/index.php?controller=search&s=${encodeURIComponent(query)}`
  }
];

const normalise = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function extractPrice(text) {
  const match = text.match(/(?:kes|ksh)\s*([\d,]+)(?:\.\d{2})?|([\d,]+)(?:\s*\.\s*\d{2})?\s*(?:kes|ksh)/i);
  if (!match) return null;
  const price = Number((match[1] || match[2]).replace(/,/g, ''));
  return Number.isFinite(price) && price > 0 ? price : null;
}

function findListing(html, productName) {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ');
  const terms = normalise(productName).split(' ').filter((term) => term.length > 2);
  const requiredTerms = terms.filter((term) => !['tissue', 'paper', 'white', 'roll', 'pack'].includes(term));
  const searchTerms = requiredTerms.length ? requiredTerms : terms;
  const lowerText = text.toLowerCase();
  const start = searchTerms.reduce((position, term) => position === -1 ? -1 : lowerText.indexOf(term, position), 0);
  let position = start;

  // A search page can mention the product in its page title before the actual
  // product card. Check every matching occurrence until one has a nearby price.
  while (position !== -1) {
    const context = text.slice(Math.max(0, position - 40), position + 700);
    const contextTerms = normalise(context);
    if (searchTerms.every((term) => contextTerms.includes(term))) {
      const price = extractPrice(text.slice(position, position + 700));
      if (price) return { price, listingName: context.slice(0, 180).trim() };
    }
    position = lowerText.indexOf(searchTerms[0], position + searchTerms[0].length);
  }

  return null;
}

export async function lookupOnlinePrices(productName) {
  if (!/\d/.test(productName)) {
    throw new Error('Include the product pack size, weight, or volume (for example, “Bella Toilet Paper 4 Pack”) before checking online prices.');
  }
  const checkedAt = new Date().toISOString();
  const responses = await Promise.allSettled(STORES.map(async (store) => {
    const sourceUrl = store.url(productName);
    const response = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'MarkerTracker price verifier/1.0' },
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error(`${store.supermarket} returned ${response.status}`);
    const listing = findListing(await response.text(), productName);
    return listing ? { ...store, ...listing, sourceUrl, checkedAt } : null;
  }));

  return responses.flatMap((result) => result.status === 'fulfilled' && result.value ? [result.value] : []);
}
