/**
 * Instagram Business posting via Meta Graph API v25.0
 * Two-step process: create media container → publish.
 * Instagram requires a public image URL for every post.
 */

const GRAPH_API = 'https://graph.facebook.com/v25.0';

/**
 * Post to Instagram Business account.
 * @param {object} options
 * @param {string} options.caption - Post caption
 * @param {string} options.imageUrl - Public image URL (required for IG)
 * @param {boolean} [options.dryRun] - If true, log instead of posting
 * @returns {Promise<{ id: string }>} - Instagram media ID
 */
async function postToInstagram({ caption, imageUrl, dryRun }) {
  const igUserId = process.env.META_IG_USER_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!igUserId || !token) {
    throw Object.assign(new Error('Missing META_IG_USER_ID or META_PAGE_ACCESS_TOKEN'), { statusCode: 401 });
  }

  if (!imageUrl) {
    throw new Error('Instagram requires an image URL — cannot post text-only');
  }

  if (dryRun) {
    console.log('[DRY RUN] Instagram post:', caption.substring(0, 80) + '...');
    return { id: 'dry_run_ig_' + Date.now() };
  }

  // Step 1: Create media container
  const containerRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: token,
    }).toString(),
  });

  const containerData = await containerRes.json();

  if (!containerRes.ok || containerData.error) {
    const err = new Error(containerData.error?.message || `Instagram container error ${containerRes.status}`);
    err.statusCode = containerData.error?.code === 190 ? 401 : containerRes.status;
    if (containerData.error?.code === 4) err.statusCode = 429;
    throw err;
  }

  const containerId = containerData.id;

  // Step 2: Wait for container to be ready (poll status)
  await waitForContainer(igUserId, containerId, token);

  // Step 3: Publish the container
  const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: token,
    }).toString(),
  });

  const publishData = await publishRes.json();

  if (!publishRes.ok || publishData.error) {
    const err = new Error(publishData.error?.message || `Instagram publish error ${publishRes.status}`);
    err.statusCode = publishData.error?.code === 190 ? 401 : publishRes.status;
    throw err;
  }

  return { id: publishData.id };
}

/**
 * Poll the container status until it's ready or fails.
 */
async function waitForContainer(igUserId, containerId, token, maxWait = 60000) {
  const start = Date.now();
  const interval = 3000; // check every 3 seconds

  while (Date.now() - start < maxWait) {
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${token}`
    );
    const data = await res.json();

    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') {
      throw new Error('Instagram media container failed: ' + (data.status || 'unknown error'));
    }

    // IN_PROGRESS — wait and retry
    await new Promise(r => setTimeout(r, interval));
  }

  throw new Error('Instagram media container timed out after ' + maxWait + 'ms');
}

module.exports = { postToInstagram };
