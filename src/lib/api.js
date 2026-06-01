// ─── Receipt Parser ───────────────────────────────────────────────────────────

export async function parseReceiptWithClaude(imageBase64, mimeType) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing VITE_ANTHROPIC_API_KEY environment variable.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageBase64 },
          },
          {
            type: 'text',
            text: `Extract all grocery line items and tax from this receipt.
For each item also provide:
- "emoji": one relevant emoji
- "searchQuery": a 2-4 word query to find a product image (e.g. "organic whole milk", "ripe bananas")

Return ONLY valid JSON, no markdown:
{
  "items": [
    {"name": "Great Value Whole Milk", "price": 3.48, "emoji": "🥛", "searchQuery": "whole milk gallon"},
    {"name": "Bananas", "price": 1.22, "emoji": "🍌", "searchQuery": "fresh bananas"}
  ],
  "tax": 1.45,
  "total": 28.44
}
If tax is not found set it to 0. Use actual prices from the receipt.`,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.map(b => b.text || '').join('') || '';
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ─── Image Fetcher ────────────────────────────────────────────────────────────

const imageCache = new Map();

export async function fetchProductImage(item) {
  const key = item.name;
  if (imageCache.has(key)) return imageCache.get(key);

  const query = item.searchQuery || item.name;

  // 1. Open Food Facts
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=6&fields=product_name,image_front_small_url,image_url`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const match = (data.products || []).find(p => p.image_front_small_url || p.image_url);
      if (match) {
        const imgUrl = match.image_front_small_url || match.image_url;
        imageCache.set(key, imgUrl);
        return imgUrl;
      }
    }
  } catch (_) { /* fall through */ }

  // 2. Unsplash source (free, no key)
  const unsplashUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(query + ' food')}`;
  imageCache.set(key, unsplashUrl);
  return unsplashUrl;
}
