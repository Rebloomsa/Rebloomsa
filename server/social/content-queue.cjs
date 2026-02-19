/**
 * Content Queue — reads pending posts from Supabase, runs brand guard,
 * fetches images, fans out to platforms, and updates status.
 */

const { validatePost } = require('./brand-guard.cjs');
const { getHashtags } = require('./hashtags.cjs');
const { withRetry } = require('./retry.cjs');
const { getImage } = require('./images.cjs');
const { postToFacebook } = require('./platforms/facebook.cjs');
const { postToInstagram } = require('./platforms/instagram.cjs');
const { postToTwitter } = require('./platforms/twitter.cjs');

/**
 * Process a single post — brand check, fetch image, publish to all platforms.
 * @param {object} post - Row from social_posts table
 * @param {object} deps - { supabaseAdmin, transporter }
 * @returns {Promise<void>}
 */
async function processPost(post, { supabaseAdmin, transporter }) {
  const dryRun = process.env.SOCIAL_DRY_RUN === 'true';

  console.log(`[SOCIAL] Processing post ${post.id} scheduled for ${post.scheduled_at}`);

  // Mark as publishing
  await supabaseAdmin.from('social_posts')
    .update({ status: 'publishing' })
    .eq('id', post.id);

  // Brand guard check
  const check = validatePost(post);
  if (!check.valid) {
    console.warn(`[SOCIAL] Post ${post.id} BLOCKED by brand guard:`, check.reasons);
    await supabaseAdmin.from('social_posts').update({
      status: 'blocked',
      brand_check_passed: false,
      error_log: 'Brand guard: ' + check.reasons.join('; '),
    }).eq('id', post.id);

    // Alert admin
    await sendAlert(transporter, {
      subject: `BLOCKED POST: ${check.reasons[0]}`,
      body: `Post ID: ${post.id}\nReasons: ${check.reasons.join('\n')}\n\nContent preview:\n${post.content.substring(0, 200)}...`,
    });
    return;
  }

  // Fetch image
  let imageUrl = post.image_url;
  if (!imageUrl && post.image_query) {
    imageUrl = await getImage(post.image_query);
  }

  // Append hashtags to content
  const hashtags = {
    facebook: getHashtags('facebook', post.hashtag_set),
    instagram: getHashtags('instagram', post.hashtag_set),
    twitter: getHashtags('twitter', post.hashtag_set),
  };

  const results = {
    fb_post_id: null,
    ig_post_id: null,
    x_post_id: null,
  };
  const errors = [];

  // Fan out to each platform independently
  for (const platform of (post.platforms || [])) {
    try {
      switch (platform) {
        case 'facebook': {
          const message = post.content + '\n\n' + hashtags.facebook;
          const result = await withRetry(
            () => postToFacebook({ message, imageUrl, dryRun }),
            { maxAttempts: 3, delays: [2 * 60 * 1000, 10 * 60 * 1000] }
          );
          if (result.success) {
            results.fb_post_id = result.result.id;
            console.log(`[SOCIAL] Facebook published: ${result.result.id}`);
          } else {
            throw result.lastError;
          }
          break;
        }

        case 'instagram': {
          if (!imageUrl) {
            console.warn(`[SOCIAL] Skipping Instagram — no image available`);
            errors.push('Instagram: skipped (no image)');
            break;
          }
          const caption = post.content + hashtags.instagram;
          const result = await withRetry(
            () => postToInstagram({ caption, imageUrl, dryRun }),
            { maxAttempts: 3, delays: [2 * 60 * 1000, 10 * 60 * 1000] }
          );
          if (result.success) {
            results.ig_post_id = result.result.id;
            console.log(`[SOCIAL] Instagram published: ${result.result.id}`);
          } else {
            throw result.lastError;
          }
          break;
        }

        case 'twitter': {
          const text = (post.content_x || post.content).substring(0, 250) + '\n\n' + hashtags.twitter;
          // Truncate to 280 chars for X
          const tweet = text.length > 280 ? text.substring(0, 277) + '...' : text;
          const result = await withRetry(
            () => postToTwitter({ text: tweet, imageUrl, dryRun }),
            { maxAttempts: 3, delays: [2 * 60 * 1000, 10 * 60 * 1000] }
          );
          if (result.success) {
            results.x_post_id = result.result.id;
            console.log(`[SOCIAL] Twitter published: ${result.result.id}`);
          } else {
            throw result.lastError;
          }
          break;
        }

        default:
          console.warn(`[SOCIAL] Unknown platform: ${platform}`);
      }
    } catch (err) {
      console.error(`[SOCIAL] ${platform} failed for post ${post.id}:`, err.message);
      errors.push(`${platform}: ${err.message}`);
    }
  }

  // Determine final status
  const publishedPlatforms = [results.fb_post_id, results.ig_post_id, results.x_post_id].filter(Boolean);
  const totalPlatforms = (post.platforms || []).length;
  const hasErrors = errors.length > 0;

  let finalStatus;
  if (publishedPlatforms.length === 0 && hasErrors) {
    finalStatus = 'failed';
  } else if (publishedPlatforms.length > 0) {
    finalStatus = 'published';
  } else {
    finalStatus = 'published'; // no platforms had errors and none needed posting
  }

  // Update post record
  await supabaseAdmin.from('social_posts').update({
    status: finalStatus,
    fb_post_id: results.fb_post_id,
    ig_post_id: results.ig_post_id,
    x_post_id: results.x_post_id,
    error_log: errors.length > 0 ? errors.join('\n') : null,
    brand_check_passed: true,
    published_at: finalStatus === 'published' ? new Date().toISOString() : null,
    image_url: imageUrl || post.image_url,
    retry_count: post.retry_count + (hasErrors ? 1 : 0),
  }).eq('id', post.id);

  // Alert admin if any platform failed
  if (finalStatus === 'failed') {
    await sendAlert(transporter, {
      subject: `FAILED POST — all platforms failed`,
      body: `Post ID: ${post.id}\nScheduled: ${post.scheduled_at}\nErrors:\n${errors.join('\n')}\n\nContent:\n${post.content}`,
    });
  }

  console.log(`[SOCIAL] Post ${post.id} — status: ${finalStatus}, published: ${publishedPlatforms.length}/${totalPlatforms}`);
}

/**
 * Get all posts that are due for publishing.
 */
async function getDuePosts(supabaseAdmin) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('[SOCIAL] Failed to fetch due posts:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Send an alert email to admin.
 */
async function sendAlert(transporter, { subject, body }) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: '"Rebloom Social Bot" <hello@rebloomsa.co.za>',
      to: process.env.NOTIFY_EMAIL,
      subject: `[Rebloom Social] ${subject}`,
      text: body,
    });
  } catch (err) {
    console.error('[SOCIAL] Alert email failed:', err.message);
  }
}

module.exports = { processPost, getDuePosts, sendAlert };
