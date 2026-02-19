/**
 * Facebook Page posting via Meta Graph API v25.0
 * Posts text or photo+caption to the Rebloom SA Facebook Page.
 */

const GRAPH_API = 'https://graph.facebook.com/v25.0';

/**
 * Post to Facebook Page.
 * @param {object} options
 * @param {string} options.message - Post text/caption
 * @param {string} [options.imageUrl] - Public image URL (optional)
 * @param {boolean} [options.dryRun] - If true, log instead of posting
 * @returns {Promise<{ id: string }>} - Facebook post ID
 */
async function postToFacebook({ message, imageUrl, dryRun }) {
  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    throw Object.assign(new Error('Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN'), { statusCode: 401 });
  }

  if (dryRun) {
    console.log('[DRY RUN] Facebook post:', message.substring(0, 80) + '...');
    return { id: 'dry_run_fb_' + Date.now() };
  }

  let url, body;

  if (imageUrl) {
    // Photo post with caption
    url = `${GRAPH_API}/${pageId}/photos`;
    body = new URLSearchParams({
      url: imageUrl,
      message,
      access_token: token,
    });
  } else {
    // Text-only post
    url = `${GRAPH_API}/${pageId}/feed`;
    body = new URLSearchParams({
      message,
      access_token: token,
    });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const err = new Error(data.error?.message || `Facebook API error ${res.status}`);
    err.statusCode = data.error?.code || res.status;
    // Map Meta error codes to HTTP-like codes for retry logic
    if (data.error?.code === 190) err.statusCode = 401; // expired token
    if (data.error?.code === 4) err.statusCode = 429;   // rate limit
    throw err;
  }

  return { id: data.id || data.post_id };
}

module.exports = { postToFacebook };
