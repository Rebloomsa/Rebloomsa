/**
 * X (Twitter) posting via X API v2 with OAuth 1.0a.
 * Free tier: 1,500 tweets/month, 50/day.
 */

const crypto = require('crypto');

const API_BASE = 'https://api.x.com/2';
const UPLOAD_BASE = 'https://upload.twitter.com/1.1';

/**
 * Post a tweet to X.
 * @param {object} options
 * @param {string} options.text - Tweet text (max 280 chars)
 * @param {string} [options.imageUrl] - Public image URL to attach (optional)
 * @param {boolean} [options.dryRun] - If true, log instead of posting
 * @returns {Promise<{ id: string }>} - Tweet ID
 */
async function postToTwitter({ text, imageUrl, dryRun }) {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw Object.assign(new Error('Missing X API credentials'), { statusCode: 401 });
  }

  if (dryRun) {
    console.log('[DRY RUN] Twitter post:', text.substring(0, 80) + '...');
    return { id: 'dry_run_x_' + Date.now() };
  }

  let mediaId = null;

  // Upload image if provided
  if (imageUrl) {
    try {
      mediaId = await uploadMedia(imageUrl, { apiKey, apiSecret, accessToken, accessSecret });
    } catch (err) {
      console.warn('Twitter image upload failed, posting text-only:', err.message);
    }
  }

  // Build tweet payload
  const payload = { text };
  if (mediaId) {
    payload.media = { media_ids: [mediaId] };
  }

  const url = `${API_BASE}/tweets`;
  const headers = getOAuthHeaders('POST', url, { apiKey, apiSecret, accessToken, accessSecret });
  headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.errors) {
    const errMsg = data.errors?.[0]?.message || data.detail || `Twitter API error ${res.status}`;
    const err = new Error(errMsg);
    err.statusCode = res.status;
    if (res.status === 429 && res.headers.get('retry-after')) {
      err.retryAfter = parseInt(res.headers.get('retry-after'), 10);
    }
    throw err;
  }

  return { id: data.data?.id };
}

/**
 * Upload media to Twitter via v1.1 media upload endpoint.
 */
async function uploadMedia(imageUrl, creds) {
  // Download image
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const base64 = buffer.toString('base64');

  const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

  const url = `${UPLOAD_BASE}/media/upload.json`;
  const params = {
    media_data: base64,
    media_category: 'tweet_image',
  };

  const headers = getOAuthHeaders('POST', url, creds, params);
  headers['Content-Type'] = 'application/x-www-form-urlencoded';

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: new URLSearchParams(params).toString(),
  });

  const data = await res.json();

  if (!res.ok || !data.media_id_string) {
    throw new Error(data.errors?.[0]?.message || `Media upload failed: ${res.status}`);
  }

  return data.media_id_string;
}

/**
 * Generate OAuth 1.0a Authorization header.
 */
function getOAuthHeaders(method, url, creds, extraParams = {}) {
  const { apiKey, apiSecret, accessToken, accessSecret } = creds;

  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  // Combine oauth params with any extra params for signature base
  const allParams = { ...oauthParams, ...extraParams };

  // Sort and encode
  const paramString = Object.keys(allParams)
    .sort()
    .map(k => `${encodeRFC3986(k)}=${encodeRFC3986(allParams[k])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    encodeRFC3986(url),
    encodeRFC3986(paramString),
  ].join('&');

  const signingKey = encodeRFC3986(apiSecret) + '&' + encodeRFC3986(accessSecret);
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeRFC3986(k)}="${encodeRFC3986(oauthParams[k])}"`)
    .join(', ');

  return { Authorization: authHeader };
}

function encodeRFC3986(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

module.exports = { postToTwitter };
