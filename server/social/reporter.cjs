/**
 * Reporter — daily summary email at 21:00 SAST + immediate alerts.
 */

const cron = require('node-cron');

/**
 * Start the daily report cron job.
 * @param {object} deps - { supabaseAdmin, transporter }
 */
function startReporter({ supabaseAdmin, transporter }) {
  const enabled = process.env.SOCIAL_ENABLED !== 'false';
  if (!enabled) return;

  console.log('[SOCIAL] Reporter started — daily summary at 21:00 SAST');

  // 21:00 SAST = 19:00 UTC
  cron.schedule('0 19 * * *', async () => {
    try {
      await sendDailyReport({ supabaseAdmin, transporter });
    } catch (err) {
      console.error('[SOCIAL] Daily report error:', err.message);
    }
  });
}

/**
 * Generate and send the daily summary report.
 */
async function sendDailyReport({ supabaseAdmin, transporter }) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setUTCHours(23, 59, 59, 999);

  // Today's posts
  const { data: todayPosts } = await supabaseAdmin
    .from('social_posts')
    .select('*')
    .gte('scheduled_at', todayStart.toISOString())
    .lte('scheduled_at', todayEnd.toISOString())
    .order('scheduled_at', { ascending: true });

  // Tomorrow's scheduled posts
  const { data: tomorrowPosts } = await supabaseAdmin
    .from('social_posts')
    .select('*')
    .gte('scheduled_at', tomorrowStart.toISOString())
    .lte('scheduled_at', tomorrowEnd.toISOString())
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: true });

  // Queue totals
  const { data: allPosts } = await supabaseAdmin
    .from('social_posts')
    .select('status');

  const counts = { pending: 0, published: 0, failed: 0, blocked: 0, publishing: 0, cancelled: 0 };
  for (const p of (allPosts || [])) {
    counts[p.status] = (counts[p.status] || 0) + 1;
  }

  // Format the date nicely
  const dateStr = now.toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Johannesburg',
  });

  // Build report
  const statusIcon = (s) => {
    switch (s) {
      case 'published': return '✅';
      case 'failed': return '❌';
      case 'blocked': return '🚫';
      case 'pending': return '⏰';
      case 'publishing': return '⏳';
      case 'cancelled': return '🚫';
      default: return '❓';
    }
  };

  let todaySection = '';
  if (todayPosts && todayPosts.length > 0) {
    todaySection = todayPosts.map(p => {
      const time = new Date(p.scheduled_at).toLocaleTimeString('en-ZA', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg',
      });
      const platforms = (p.platforms || []).join(', ');
      const preview = p.content.substring(0, 50).replace(/\n/g, ' ');
      return `  ${statusIcon(p.status)} ${platforms} — ${time} — "${preview}..." — ${p.status}`;
    }).join('\n');
  } else {
    todaySection = '  No posts scheduled for today.';
  }

  let tomorrowSection = '';
  if (tomorrowPosts && tomorrowPosts.length > 0) {
    tomorrowSection = tomorrowPosts.map(p => {
      const time = new Date(p.scheduled_at).toLocaleTimeString('en-ZA', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg',
      });
      const platforms = (p.platforms || []).join(', ');
      const preview = p.content.substring(0, 50).replace(/\n/g, ' ');
      return `  ⏰ ${platforms} — ${time} — "${preview}..."`;
    }).join('\n');
  } else {
    tomorrowSection = '  No posts scheduled for tomorrow.';
  }

  // Issues
  const issues = (todayPosts || []).filter(p => p.status === 'failed' || p.status === 'blocked');
  let issuesSection = '';
  if (issues.length > 0) {
    issuesSection = issues.map(p =>
      `  ${statusIcon(p.status)} Post ${p.id.substring(0, 8)}... — ${p.error_log || 'unknown error'}`
    ).join('\n');
  } else {
    issuesSection = '  None — all systems healthy.';
  }

  const dryRunNote = process.env.SOCIAL_DRY_RUN === 'true' ? '\n⚠️  DRY RUN MODE — no real posts were published\n' : '';

  const report = `
═══════════════════════════════════════
  REBLOOM SA — SOCIAL MEDIA REPORT
  ${dateStr}
═══════════════════════════════════════
${dryRunNote}
TODAY'S POSTS:
${todaySection}

TOMORROW'S SCHEDULED:
${tomorrowSection}

ISSUES (${issues.length}):
${issuesSection}

QUEUE STATUS:
  Pending: ${counts.pending} | Published: ${counts.published} | Failed: ${counts.failed} | Blocked: ${counts.blocked}
`.trim();

  console.log('[SOCIAL] Daily report:\n' + report);

  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: '"Rebloom Social Bot" <hello@rebloomsa.co.za>',
      to: process.env.NOTIFY_EMAIL,
      subject: `Rebloom Social — Daily Report [${now.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' })}]`,
      html: `
        <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; padding: 24px; border-radius: 8px;">
          <pre style="white-space: pre-wrap; font-size: 13px; line-height: 1.6;">${report.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
      `,
    });
    console.log('[SOCIAL] Daily report email sent');
  } catch (err) {
    console.error('[SOCIAL] Daily report email failed:', err.message);
  }
}

module.exports = { startReporter, sendDailyReport };
