/**
 * Image handler — Pexels API with local fallback chain.
 * Fetches brand-safe images for social media posts.
 *
 * Fallback chain:
 * 1. Pexels API search
 * 2. Local fallback gallery
 * 3. null (text-only post) — never blocks a post because of image failure
 */

const fs = require('fs');
const path = require('path');

const PEXELS_API = 'https://api.pexels.com/v1/search';
const CACHE_DIR = path.resolve(__dirname, 'image-cache');
const FALLBACK_DIR = path.resolve(__dirname, 'fallback-images');

/**
 * Get a public image URL for a post.
 * @param {string} query - Search query (e.g., "cherry blossom sunrise hope")
 * @param {object} [options]
 * @param {'landscape'|'square'} [options.orientation='landscape']
 * @returns {Promise<string|null>} Public image URL or null
 */
async function getImage(query, options = {}) {
  const orientation = options.orientation || 'landscape';

  // Try Pexels first
  try {
    const url = await fetchFromPexels(query, orientation);
    if (url) return url;
  } catch (err) {
    console.warn('Pexels fetch failed:', err.message);
  }

  // Try local fallback gallery
  try {
    const localUrl = getLocalFallback();
    if (localUrl) return localUrl;
  } catch (err) {
    console.warn('Local fallback failed:', err.message);
  }

  // Never block a post because of image failure
  console.warn('No image available for query:', query);
  return null;
}

/**
 * Fetch image from Pexels API.
 * Returns a direct URL to the image (publicly accessible).
 */
async function fetchFromPexels(query, orientation) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('PEXELS_API_KEY not set');
    return null;
  }

  const params = new URLSearchParams({
    query,
    per_page: '10',
    orientation,
    size: 'large',
  });

  const res = await fetch(`${PEXELS_API}?${params}`, {
    headers: { Authorization: apiKey },
  });

  if (!res.ok) {
    throw new Error(`Pexels API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data.photos || data.photos.length === 0) {
    return null;
  }

  // Pick a random photo from top 10 results
  const photo = data.photos[Math.floor(Math.random() * data.photos.length)];

  // Return the landscape version for FB/X, or original for IG
  // Pexels URLs are publicly accessible — perfect for Meta and X APIs
  return orientation === 'square' ? photo.src.large : photo.src.landscape;
}

/**
 * Get a random image from the local fallback gallery.
 * Returns null if no fallback images exist.
 * Note: local files won't work as URLs for Instagram/Facebook APIs.
 * This would need to be served via a public URL in production.
 */
function getLocalFallback() {
  if (!fs.existsSync(FALLBACK_DIR)) return null;

  const files = fs.readdirSync(FALLBACK_DIR).filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  if (files.length === 0) return null;

  const file = files[Math.floor(Math.random() * files.length)];
  return path.join(FALLBACK_DIR, file);
}

module.exports = { getImage };
