const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env from project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Supabase admin client (service_role key for user management)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify().then(() => {
  console.log('SMTP connection verified');
}).catch((err) => {
  console.error('SMTP connection failed:', err.message);
});

// --- Referral code validation ---
app.get('/api/referral/:code', async (req, res) => {
  const { code } = req.params;
  if (!code) return res.status(400).json({ error: 'Code required' });
  try {
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select('name')
      .eq('referral_code', code)
      .single();
    if (error || !member) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }
    res.json({ firstName: member.name.split(' ')[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate referral' });
  }
});

// --- Waitlist signup emails ---
app.post('/api/waitlist-email', async (req, res) => {
  const { name, email, province, age_range, story } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }

  try {
    // 1. Confirmation email to the person who signed up
    await transporter.sendMail({
      from: '"Rebloom SA" <hello@rebloomsa.co.za>',
      to: email,
      subject: 'Welcome to Rebloom SA — You\'re on the waitlist!',
      html: `
        <div style="font-family: 'Lato', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2a3d4e;">
          <div style="text-align: center; padding: 32px 0 24px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 28px; color: #2a3d4e; margin: 0;">
              Welcome to Rebloom SA
            </h1>
          </div>
          <div style="background: #faf8f5; border-radius: 12px; padding: 32px;">
            <p style="font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for joining our waitlist! You've taken the first step towards finding
              meaningful companionship with people who truly understand your journey.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Your profile will be personally reviewed by our founder, Darryl James,
              and we'll be in touch soon with next steps.
            </p>
            <div style="background: #e8b4b8; background: linear-gradient(135deg, #e8b4b8 0%, #c97d60 100%); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="color: white; font-size: 18px; font-style: italic; margin: 0;">
                "After loss, life doesn't end — it blooms again."
              </p>
            </div>
            <p style="font-size: 14px; color: #2a3d4e; opacity: 0.6; line-height: 1.5;">
              In the meantime, feel free to reach out to us at
              <a href="mailto:hello@rebloomsa.co.za" style="color: #c97d60;">hello@rebloomsa.co.za</a>
              or via WhatsApp if you have any questions.
            </p>
          </div>
          <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #2a3d4e; opacity: 0.4;">
            <p>&copy; ${new Date().getFullYear()} Rebloom SA. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    // 2. Notification email to the owner
    await transporter.sendMail({
      from: '"Rebloom SA Notifications" <hello@rebloomsa.co.za>',
      to: process.env.NOTIFY_EMAIL,
      subject: `New waitlist signup: ${name} from ${province}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2a3d4e;">
          <h2 style="color: #c97d60;">New Waitlist Signup</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Province:</td><td style="padding: 8px 0;">${province}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Age Range:</td><td style="padding: 8px 0;">${age_range}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Story:</td><td style="padding: 8px 0;">${story || '(not provided)'}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 12px; color: #999;">
            Submitted at ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
          </p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// --- Newsletter subscription email ---
app.post('/api/newsletter-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Confirmation to subscriber
    await transporter.sendMail({
      from: '"Rebloom SA" <hello@rebloomsa.co.za>',
      to: email,
      subject: 'You\'re subscribed to Rebloom SA updates!',
      html: `
        <div style="font-family: 'Lato', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2a3d4e;">
          <div style="text-align: center; padding: 32px 0 24px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 28px; color: #2a3d4e; margin: 0;">
              You're Subscribed!
            </h1>
          </div>
          <div style="background: #faf8f5; border-radius: 12px; padding: 32px;">
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for subscribing to the Rebloom SA newsletter.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              You'll receive updates on our launch, community stories,
              and helpful resources for your journey.
            </p>
            <p style="font-size: 14px; color: #2a3d4e; opacity: 0.6; line-height: 1.5; margin-top: 24px;">
              If you didn't subscribe, you can safely ignore this email.
            </p>
          </div>
          <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #2a3d4e; opacity: 0.4;">
            <p>&copy; ${new Date().getFullYear()} Rebloom SA. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    // Notification to owner
    await transporter.sendMail({
      from: '"Rebloom SA Notifications" <hello@rebloomsa.co.za>',
      to: process.env.NOTIFY_EMAIL,
      subject: `New newsletter subscriber: ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #2a3d4e;">
          <h2 style="color: #c97d60;">New Newsletter Subscriber</h2>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="font-size: 12px; color: #999;">
            Subscribed at ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
          </p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// --- Admin middleware: verify the requesting user is the admin ---
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = authHeader.replace('Bearer ', '');
  // Look up the user to verify they're the admin
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !user || user.email !== process.env.NOTIFY_EMAIL) {
    return res.status(403).json({ error: 'Forbidden — admin access only' });
  }
  req.adminUser = user;
  next();
}

// --- Get all waitlist entries ---
app.get('/api/admin/waitlist', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Fetch waitlist error:', err.message);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

// --- Approve a waitlist entry ---
app.post('/api/admin/approve', requireAdmin, async (req, res) => {
  const { waitlistId } = req.body;
  if (!waitlistId) return res.status(400).json({ error: 'waitlistId required' });

  try {
    // 1. Get the waitlist entry
    const { data: entry, error: fetchErr } = await supabaseAdmin
      .from('waitlist')
      .select('*')
      .eq('id', waitlistId)
      .single();
    if (fetchErr || !entry) throw new Error('Waitlist entry not found');
    if (entry.status === 'approved') return res.json({ success: true, message: 'Already approved' });

    // 2. Create Supabase Auth user with a temporary password
    const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: entry.email,
      password: tempPassword,
      email_confirm: true,
    });
    if (authErr) throw authErr;

    // 3. Generate unique referral code (6-char alphanumeric)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let referralCode = '';
    for (let i = 0; i < 6; i++) referralCode += chars.charAt(Math.floor(Math.random() * chars.length));

    // 4. Insert member profile
    const { error: memberErr } = await supabaseAdmin.from('members').insert([{
      id: authData.user.id,
      name: entry.name,
      email: entry.email,
      province: entry.province,
      age_range: entry.age_range,
      bio: entry.story || null,
      referral_code: referralCode,
    }]);
    if (memberErr) throw memberErr;

    // 5. If this person was referred, notify the referrer
    if (entry.referred_by) {
      try {
        const { data: referrer } = await supabaseAdmin
          .from('members')
          .select('id')
          .eq('referral_code', entry.referred_by)
          .single();
        if (referrer) {
          await supabaseAdmin.from('messages').insert({
            sender_id: req.adminUser.id,
            recipient_id: referrer.id,
            content: `Your friend ${entry.name.split(' ')[0]} has joined Rebloom. Thank you for helping grow this community.`,
          });
        }
      } catch (refErr) {
        console.warn('Referral notification failed (non-blocking):', refErr.message);
      }
    }

    // 6. Send a welcome message from the founder (in-app)
    try {
      await supabaseAdmin.from('messages').insert({
        sender_id: req.adminUser.id,
        recipient_id: authData.user.id,
        content: `Hi ${entry.name.split(' ')[0]}, my name is Darryl James and I created Rebloom SA because I watched my mother navigate one of the most difficult journeys anyone can face — finding connection again after losing my father.\n\nAfter his passing, I saw her struggle with loneliness and the desire for companionship, but the existing options felt wrong. That's why I built Rebloom — a place where widows and widowers across South Africa can find understanding, safety, and meaningful connections.\n\nEvery member is personally verified by me because I believe this community deserves nothing less than genuine care. I personally reviewed your profile and I'm glad you're here.\n\nIf you're not sure where to start, just browse the directory and say hello to someone. Everyone here remembers what that first message felt like.\n\nAfter loss, life doesn't end — it blooms again.\n\n— Darryl James, Founder of Rebloom SA`,
      });
    } catch (msgErr) {
      console.warn('Welcome message failed (non-blocking):', msgErr.message);
    }

    // 7. Update waitlist status
    await supabaseAdmin.from('waitlist').update({ status: 'approved' }).eq('id', waitlistId);

    // 8. Send password reset email so user can set their own password
    await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: entry.email,
    });

    // 9. Send styled approval email via SMTP
    try {
      await transporter.sendMail({
        from: '"Rebloom SA" <hello@rebloomsa.co.za>',
        to: entry.email,
        subject: "You've been accepted into Rebloom SA!",
        html: `
          <div style="font-family: 'Lato', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2a3d4e;">
            <div style="text-align: center; padding: 32px 0 24px;">
              <h1 style="font-family: 'Georgia', serif; font-size: 28px; color: #2a3d4e; margin: 0;">
                Welcome to Rebloom SA
              </h1>
            </div>
            <div style="background: #faf8f5; border-radius: 12px; padding: 32px;">
              <p style="font-size: 16px; line-height: 1.6;">Hi <strong>${entry.name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6;">
                Great news — your application has been reviewed and <strong>approved</strong>!
                You're now a member of the Rebloom SA community.
              </p>
              <p style="font-size: 16px; line-height: 1.6;">
                To get started, click the button below to set your password and access
                the member area where you can connect with other members.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${process.env.SITE_URL || 'https://rebloomsa.co.za'}/login"
                   style="display: inline-block; background: #c97d60; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Set Your Password & Join
                </a>
              </div>
              <p style="font-size: 14px; color: #2a3d4e; opacity: 0.6; line-height: 1.5;">
                On the login page, enter your email and click "Forgot your password?" to receive a link to set your password.
              </p>
              <div style="background: linear-gradient(135deg, #e8b4b8 0%, #c97d60 100%); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="color: white; font-size: 18px; font-style: italic; margin: 0;">
                  "After loss, life doesn't end — it blooms again."
                </p>
              </div>
            </div>
            <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #2a3d4e; opacity: 0.4;">
              <p>&copy; ${new Date().getFullYear()} Rebloom SA. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('Approval email failed (non-blocking):', emailErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Approve error:', err.message);
    res.status(500).json({ error: err.message || 'Approval failed' });
  }
});

// --- Reject a waitlist entry ---
app.post('/api/admin/reject', requireAdmin, async (req, res) => {
  const { waitlistId } = req.body;
  if (!waitlistId) return res.status(400).json({ error: 'waitlistId required' });

  try {
    const { error } = await supabaseAdmin
      .from('waitlist')
      .update({ status: 'rejected' })
      .eq('id', waitlistId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Reject error:', err.message);
    res.status(500).json({ error: 'Rejection failed' });
  }
});

// --- Export CSV (waitlist + newsletter) ---
app.get('/api/admin/export', requireAdmin, async (req, res) => {
  try {
    const [waitlistRes, newsletterRes] = await Promise.all([
      supabaseAdmin.from('waitlist').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('newsletter').select('*').order('created_at', { ascending: false }),
    ]);

    let csv = 'Type,Name,Email,Province,Age Range,Story,Status,Date\n';

    for (const w of (waitlistRes.data || [])) {
      const story = (w.story || '').replace(/"/g, '""');
      csv += `Waitlist,"${w.name}","${w.email}","${w.province}","${w.age_range}","${story}","${w.status || 'pending'}","${w.created_at}"\n`;
    }
    for (const n of (newsletterRes.data || [])) {
      csv += `Newsletter,,"${n.email}",,,,,,"${n.created_at}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=rebloom-export.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err.message);
    res.status(500).json({ error: 'Export failed' });
  }
});

// --- Weekly email digest ---
app.post('/api/admin/send-weekly-digest', requireAdmin, async (req, res) => {
  try {
    // 1. Fetch all members
    const { data: members, error: membersErr } = await supabaseAdmin
      .from('members')
      .select('id, name, email, last_digest_at');
    if (membersErr) throw membersErr;

    // 2. Count new members in the past 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newMemberCount } = await supabaseAdmin
      .from('members')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo);

    let sentCount = 0;
    const siteUrl = process.env.SITE_URL || 'https://rebloomsa.co.za';

    for (const member of (members || [])) {
      // 3. Count unread messages for this member
      const { count: unreadCount } = await supabaseAdmin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', member.id)
        .is('read_at', null);

      const unread = unreadCount || 0;
      const newMembers = newMemberCount || 0;

      // 4. Skip if nothing to report
      if (unread === 0 && newMembers === 0) continue;

      // 5. Send branded digest email
      try {
        await transporter.sendMail({
          from: '"Rebloom SA" <hello@rebloomsa.co.za>',
          to: member.email,
          subject: 'This week at Rebloom',
          html: `
            <div style="font-family: 'Lato', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2a3d4e;">
              <div style="text-align: center; padding: 32px 0 24px;">
                <h1 style="font-family: 'Georgia', serif; font-size: 28px; color: #2a3d4e; margin: 0;">
                  This Week at Rebloom
                </h1>
              </div>
              <div style="background: #faf8f5; border-radius: 12px; padding: 32px;">
                <p style="font-size: 16px; line-height: 1.6;">Hi <strong>${member.name.split(' ')[0]}</strong>,</p>
                ${unread > 0 ? `<p style="font-size: 16px; line-height: 1.6;">You have <strong>${unread} unread message${unread === 1 ? '' : 's'}</strong> waiting for you.</p>` : ''}
                ${newMembers > 0 ? `<p style="font-size: 16px; line-height: 1.6;"><strong>${newMembers} new member${newMembers === 1 ? '' : 's'}</strong> joined this week.</p>` : ''}
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${siteUrl}/members"
                     style="display: inline-block; background: #c97d60; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    Come Back to Rebloom
                  </a>
                </div>
                <div style="background: linear-gradient(135deg, #e8b4b8 0%, #c97d60 100%); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                  <p style="color: white; font-size: 18px; font-style: italic; margin: 0;">
                    "After loss, life doesn't end — it blooms again."
                  </p>
                </div>
              </div>
              <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #2a3d4e; opacity: 0.4;">
                <p>&copy; ${new Date().getFullYear()} Rebloom SA. All rights reserved.</p>
              </div>
            </div>
          `,
        });

        // 6. Update last_digest_at
        await supabaseAdmin
          .from('members')
          .update({ last_digest_at: new Date().toISOString() })
          .eq('id', member.id);

        sentCount++;
      } catch (emailErr) {
        console.warn(`Digest email failed for ${member.email}:`, emailErr.message);
      }
    }

    res.json({ success: true, sent: sentCount, total: (members || []).length });
  } catch (err) {
    console.error('Weekly digest error:', err.message);
    res.status(500).json({ error: 'Failed to send weekly digest' });
  }
});

// --- Message notification emails (with throttle) ---
const messageNotifyThrottle = new Map(); // recipientId → lastNotifiedAt timestamp

app.post('/api/message-notification', async (req, res) => {
  const { recipientId, senderName } = req.body;

  if (!recipientId || !senderName) {
    return res.status(400).json({ error: 'recipientId and senderName required' });
  }

  // Throttle: max one email per recipient every 5 minutes
  const now = Date.now();
  const lastNotified = messageNotifyThrottle.get(recipientId);
  if (lastNotified && now - lastNotified < 5 * 60 * 1000) {
    return res.json({ success: true, throttled: true });
  }

  try {
    // Look up recipient email
    const { data: member, error: memberErr } = await supabaseAdmin
      .from('members')
      .select('email, name')
      .eq('id', recipientId)
      .single();

    if (memberErr || !member || !member.email) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const siteUrl = process.env.SITE_URL || 'https://rebloomsa.co.za';

    await transporter.sendMail({
      from: '"Rebloom SA" <hello@rebloomsa.co.za>',
      to: member.email,
      subject: `New message from ${senderName} on Rebloom SA`,
      html: `
        <div style="font-family: 'Lato', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #2a3d4e;">
          <div style="text-align: center; padding: 32px 0 24px;">
            <h1 style="font-family: 'Georgia', serif; font-size: 28px; color: #2a3d4e; margin: 0;">
              Rebloom SA
            </h1>
          </div>
          <div style="background: #faf8f5; border-radius: 12px; padding: 32px;">
            <p style="font-size: 16px; line-height: 1.6;">Hi <strong>${member.name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6;">
              You have a new message from <strong>${senderName}</strong> on Rebloom SA.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${siteUrl}/members/messages"
                 style="display: inline-block; background: #c97d60; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Read Message
              </a>
            </div>
            <p style="font-size: 14px; color: #2a3d4e; opacity: 0.6; line-height: 1.5;">
              If you didn't expect this message, you can safely ignore this email.
            </p>
          </div>
          <div style="text-align: center; padding: 24px 0; font-size: 12px; color: #2a3d4e; opacity: 0.4;">
            <p>&copy; ${new Date().getFullYear()} Rebloom SA. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    messageNotifyThrottle.set(recipientId, now);
    res.json({ success: true });
  } catch (err) {
    console.error('Message notification email error:', err.message);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

const PORT = process.env.API_PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Email API server running on port ${PORT}`);
});
