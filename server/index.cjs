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

    // 3. Insert member profile
    const { error: memberErr } = await supabaseAdmin.from('members').insert([{
      id: authData.user.id,
      name: entry.name,
      email: entry.email,
      province: entry.province,
      age_range: entry.age_range,
      bio: entry.story || null,
    }]);
    if (memberErr) throw memberErr;

    // 4. Send a welcome message from the founder (in-app)
    try {
      await supabaseAdmin.from('messages').insert({
        sender_id: req.adminUser.id,
        recipient_id: authData.user.id,
        content: `Hi ${entry.name.split(' ')[0]}, this is Darryl — I founded Rebloom after losing my own partner. I personally reviewed your profile and I'm glad you're here.\n\nIf you're not sure where to start, just browse the directory and say hello to someone. Everyone here remembers what that first message felt like.\n\nNo pressure. Welcome home.\n\n— Darryl`,
      });
    } catch (msgErr) {
      console.warn('Welcome message failed (non-blocking):', msgErr.message);
    }

    // 5. Update waitlist status
    await supabaseAdmin.from('waitlist').update({ status: 'approved' }).eq('id', waitlistId);

    // 6. Send password reset email so user can set their own password
    await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: entry.email,
    });

    // 7. Send styled approval email via SMTP
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
                Use the "Forgot password" link on the login page to set your password for the first time.
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
