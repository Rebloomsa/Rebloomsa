/**
 * Recovery — detects missed posts on server startup and publishes them
 * with a 5-minute stagger to avoid spam.
 */

const { processPost } = require('./content-queue.cjs');
const { sendAlert } = require('./content-queue.cjs');

/**
 * Check for and recover missed posts (pending posts with scheduled_at in the past 24h).
 * @param {object} deps - { supabaseAdmin, transporter }
 */
async function recoverMissedPosts({ supabaseAdmin, transporter }) {
  const enabled = process.env.SOCIAL_ENABLED !== 'false';
  if (!enabled) return;

  const now = new Date();
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

  const { data: missedPosts, error } = await supabaseAdmin
    .from('social_posts')
    .select('*')
    .eq('status', 'pending')
    .lt('scheduled_at', now.toISOString())
    .gte('scheduled_at', twentyFourHoursAgo.toISOString())
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('[SOCIAL] Recovery query failed:', error.message);
    return;
  }

  if (!missedPosts || missedPosts.length === 0) {
    console.log('[SOCIAL] Recovery: no missed posts found');
    return;
  }

  console.log(`[SOCIAL] Recovery: found ${missedPosts.length} missed post(s) — publishing with 5-min stagger`);

  // Alert admin about recovery
  await sendAlert(transporter, {
    subject: `Server restart — recovering ${missedPosts.length} missed post(s)`,
    body: `The server restarted and found ${missedPosts.length} post(s) that were scheduled in the past 24 hours but not yet published.\n\nRecovering now with 5-minute stagger.\n\nPosts:\n${missedPosts.map(p => `  - ${p.scheduled_at}: ${p.content.substring(0, 60)}...`).join('\n')}`,
  });

  for (let i = 0; i < missedPosts.length; i++) {
    const post = missedPosts[i];
    console.log(`[SOCIAL] Recovery: processing post ${i + 1}/${missedPosts.length} — ${post.id}`);

    await processPost(post, { supabaseAdmin, transporter });

    // Stagger 5 minutes between posts (except after last one)
    if (i < missedPosts.length - 1) {
      console.log('[SOCIAL] Recovery: waiting 5 minutes before next post...');
      await new Promise(r => setTimeout(r, 5 * 60 * 1000));
    }
  }

  console.log('[SOCIAL] Recovery complete');
}

module.exports = { recoverMissedPosts };
