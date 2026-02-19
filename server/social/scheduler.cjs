/**
 * Scheduler — node-cron job that checks social_posts table every minute
 * and processes any posts that are due.
 */

const cron = require('node-cron');
const { getDuePosts, processPost } = require('./content-queue.cjs');

let isProcessing = false;

/**
 * Start the social media scheduler.
 * @param {object} deps - { supabaseAdmin, transporter }
 */
function startScheduler({ supabaseAdmin, transporter }) {
  const enabled = process.env.SOCIAL_ENABLED !== 'false';

  if (!enabled) {
    console.log('[SOCIAL] Scheduler DISABLED (SOCIAL_ENABLED=false)');
    return;
  }

  console.log('[SOCIAL] Scheduler started — checking every minute');
  const dryRun = process.env.SOCIAL_DRY_RUN === 'true';
  if (dryRun) {
    console.log('[SOCIAL] DRY RUN mode — posts will be logged but not published');
  }

  // Check every minute for due posts
  cron.schedule('* * * * *', async () => {
    // Prevent overlapping runs
    if (isProcessing) return;
    isProcessing = true;

    try {
      const duePosts = await getDuePosts(supabaseAdmin);

      if (duePosts.length > 0) {
        console.log(`[SOCIAL] ${duePosts.length} post(s) due for publishing`);
      }

      for (const post of duePosts) {
        await processPost(post, { supabaseAdmin, transporter });
        // Small delay between posts to avoid rate limits
        if (duePosts.length > 1) {
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    } catch (err) {
      console.error('[SOCIAL] Scheduler error:', err.message);
    } finally {
      isProcessing = false;
    }
  });
}

module.exports = { startScheduler };
