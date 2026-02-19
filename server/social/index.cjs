/**
 * Social automation module — entry point.
 * Phase C: Scheduler, recovery, reporter, and admin routes.
 */
const { validatePost } = require('./brand-guard.cjs');
const { startScheduler } = require('./scheduler.cjs');
const { recoverMissedPosts } = require('./recovery.cjs');
const { startReporter, sendDailyReport } = require('./reporter.cjs');

/**
 * Initialize the social automation module.
 * @param {object} deps - { app, supabaseAdmin, transporter, requireAdmin }
 */
function init({ app, supabaseAdmin, transporter, requireAdmin }) {
  console.log('[SOCIAL] Social automation module initializing...');

  // --- Admin routes ---

  // GET /api/admin/social/posts — list posts with optional status filter
  app.get('/api/admin/social/posts', requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      let query = supabaseAdmin
        .from('social_posts')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      res.json(data);
    } catch (err) {
      console.error('Fetch social posts error:', err.message);
      res.status(500).json({ error: 'Failed to fetch social posts' });
    }
  });

  // POST /api/admin/social/posts — manually add a post to the queue
  app.post('/api/admin/social/posts', requireAdmin, async (req, res) => {
    try {
      const { content, content_x, platforms, scheduled_at, hashtag_set, image_query, image_url } = req.body;

      if (!content || !platforms || !scheduled_at) {
        return res.status(400).json({ error: 'content, platforms, and scheduled_at are required' });
      }

      // Brand guard validation
      const check = validatePost({ content, content_x });
      if (!check.valid) {
        return res.status(422).json({
          error: 'Post rejected by brand guard',
          reasons: check.reasons,
        });
      }

      const { data, error } = await supabaseAdmin.from('social_posts').insert({
        content,
        content_x: content_x || null,
        platforms,
        scheduled_at,
        hashtag_set: hashtag_set || null,
        image_query: image_query || null,
        image_url: image_url || null,
        status: 'pending',
        brand_check_passed: true,
      }).select().single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      console.error('Create social post error:', err.message);
      res.status(500).json({ error: 'Failed to create social post' });
    }
  });

  // POST /api/admin/social/posts/:id/cancel — cancel a pending post
  app.post('/api/admin/social/posts/:id/cancel', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      const { data: post, error: fetchErr } = await supabaseAdmin
        .from('social_posts')
        .select('id, status')
        .eq('id', id)
        .single();

      if (fetchErr || !post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.status !== 'pending') {
        return res.status(400).json({ error: `Cannot cancel a post with status "${post.status}"` });
      }

      const { error } = await supabaseAdmin
        .from('social_posts')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      console.error('Cancel social post error:', err.message);
      res.status(500).json({ error: 'Failed to cancel post' });
    }
  });

  // GET /api/admin/social/report — trigger daily report on demand
  app.get('/api/admin/social/report', requireAdmin, async (req, res) => {
    try {
      await sendDailyReport({ supabaseAdmin, transporter });
      res.json({ success: true });
    } catch (err) {
      console.error('Manual report error:', err.message);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  // --- Start scheduler, recovery, and reporter ---

  // Recovery first — process any missed posts from the last 24h
  recoverMissedPosts({ supabaseAdmin, transporter }).catch(err => {
    console.error('[SOCIAL] Recovery failed:', err.message);
  });

  // Start the cron scheduler (checks every minute)
  startScheduler({ supabaseAdmin, transporter });

  // Start the daily report (21:00 SAST)
  startReporter({ supabaseAdmin, transporter });

  console.log('[SOCIAL] Social automation module ready');
}

module.exports = { init };
