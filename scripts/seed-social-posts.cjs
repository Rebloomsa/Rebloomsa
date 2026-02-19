/**
 * Seed social_posts table with Week 1–4 content from posting-schedule.md.
 * Idempotent — checks for existing posts by scheduled_at before inserting.
 * Run: node scripts/seed-social-posts.cjs
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// All times are SAST (UTC+2), so we subtract 2 hours for UTC
function sast(dateStr, time) {
  // dateStr: "2026-02-17", time: "08:00"
  return new Date(`${dateStr}T${time}:00+02:00`).toISOString();
}

const POSTS = [
  // === WEEK 1 ===
  // Day 1 — Mon 17 Feb — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-02-17', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `I built Rebloom SA because I watched my mother navigate one of the most difficult journeys anyone can face — finding connection again after losing my father.

After his passing, I saw her struggle with loneliness and the desire for companionship. The existing options felt wrong — impersonal, unsafe, or simply not designed for someone in her situation.

So I built Rebloom. A private, verified community exclusively for widows and widowers in South Africa.

Every member is personally reviewed. Every profile is real. Every conversation is safe.

If you or someone you love is on this journey, Rebloom is here.

🌸 www.rebloomsa.co.za
Free to join during early access.

#RebloomSA #AfterLossLifeBloomsAgain #WidowsOfSouthAfrica #WidowersOfSouthAfrica #FindConnectionAgain #GriefSupport #SouthAfrica`,
    content_x: `I built Rebloom SA because I watched my mother navigate losing my father alone.

Rebloom is a free, verified community for widows & widowers in South Africa. Every member is personally reviewed. No fakes. No games.

🌸 rebloomsa.co.za

#RebloomSA #SouthAfrica`,
    image_query: 'cherry blossom sunrise hope',
  },

  // Day 2 — Tue 18 Feb — 12:00 — FB + IG + X
  {
    scheduled_at: sast('2026-02-18', '12:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `What makes Rebloom SA different?

🔒 Every member is personally verified — no fakes, no scams
💬 Private messaging between members
👥 A directory of real people in your province
📧 Weekly community updates
🆓 Completely free during early access

This isn't a dating app. It's a community built on understanding, safety, and hope.

For widows and widowers in South Africa who are ready to connect with people who truly get it.

👉 www.rebloomsa.co.za

🌸 #RebloomSA #SafeSpace #WidowCommunity #SouthAfrica`,
    content_x: `What makes @RebloomSA different?

🔒 Every member personally verified
💬 Private messaging
👥 Directory by province
🆓 Free during early access

Not a dating app. A community built on understanding.

🌸 rebloomsa.co.za #RebloomSA`,
    image_query: 'community warmth connection people',
  },

  // Day 3 — Wed 19 Feb — 18:00 — FB + IG
  {
    scheduled_at: sast('2026-02-19', '18:00'),
    platforms: ['facebook', 'instagram'],
    content: `Losing a spouse doesn't just take a person from your life. It takes your dinner companion, your travel partner, your 3am confidant, your reason to cook for two.

Rebloom SA exists because no one should have to rebuild alone.

A verified community for widows and widowers in South Africa. Real people. Safe connections. No judgement.

🌸 www.rebloomsa.co.za

Tag someone who might need this. Share if you care.

#RebloomSA #YouAreNotAlone #AfterLossLifeBloomsAgain #Widowed #SouthAfrica`,
    content_x: null,
    image_query: 'nature gentle light hope flowers',
  },

  // Day 4 — Thu 20 Feb — 08:00 — FB + X
  {
    scheduled_at: sast('2026-02-20', '08:00'),
    platforms: ['facebook', 'twitter'],
    content: `You might not need Rebloom SA — but someone you know might.

A parent. A colleague. A neighbour. A friend from church.

1 in 5 South Africans over 50 has lost a spouse. Many of them are navigating it alone.

Rebloom SA is a free, verified community built specifically for them.

Please share this post. It costs you nothing but could change someone's world.

🌸 www.rebloomsa.co.za

#RebloomSA #ShareToHelp #CommunityMatters #SouthAfrica`,
    content_x: `You might not need Rebloom SA — but someone you know does.

1 in 5 South Africans over 50 has lost a spouse.

Please RT. It costs nothing but could change someone's world.

🌸 rebloomsa.co.za #RebloomSA #ShareToHelp`,
    image_query: 'hands community sharing kindness',
  },

  // Day 5 — Fri 21 Feb — 12:00 — IG + FB
  {
    scheduled_at: sast('2026-02-21', '12:00'),
    platforms: ['instagram', 'facebook'],
    content: `Building Rebloom SA has been a labour of love. Every member application that comes in reminds me why this matters.

To everyone who has signed up this week — thank you for trusting us with your journey. You're not just joining a platform. You're helping build a community that didn't exist before.

If you haven't joined yet, the door is open:
🌸 www.rebloomsa.co.za

#RebloomSA #BuildingInPublic #CommunityFirst #SouthAfrica`,
    content_x: null,
    image_query: 'sunrise new beginning blossom',
  },

  // Day 6 — Sat 22 Feb — 09:00 — FB + IG
  {
    scheduled_at: sast('2026-02-22', '09:00'),
    platforms: ['facebook', 'instagram'],
    content: `Saturday morning thought:

Weekends can be the hardest time when you've lost your person. The empty chair at breakfast. The quiet house.

If that's you today, know this: you're not alone. There's a whole community of people who understand exactly how that feels.

Rebloom SA is a safe space to connect with them.

🌸 www.rebloomsa.co.za

Wishing you a gentle weekend.

#RebloomSA #WeekendThoughts #YouAreNotAlone`,
    content_x: null,
    image_query: 'peaceful morning nature gentle',
  },

  // Day 7 — Sun 23 Feb — 10:00 — FB + X
  {
    scheduled_at: sast('2026-02-23', '10:00'),
    platforms: ['facebook', 'twitter'],
    content: `One week since Rebloom SA launched, and the response has been humbling.

To every person who signed up, shared a post, or forwarded our link to someone who needed it — thank you.

"Religion that God our Father accepts as pure and faultless is this: to look after orphans and widows in their distress." — James 1:27

If your church or community has widowed members, please share Rebloom with them. It's free, private, and safe.

🌸 www.rebloomsa.co.za

#RebloomSA #SundayReflection #Community #SouthAfrica`,
    content_x: null,
    image_query: 'church community faith hope',
  },

  // === WEEK 2 ===
  // Mon 24 Feb — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-02-24', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Rebloom SA update: We're growing! New members joining from across South Africa.

If you've been thinking about joining, now is the time. Early access is free and our community is warm and welcoming.

👉 www.rebloomsa.co.za

🌸 #RebloomSA #JoinUs`,
    content_x: `Rebloom SA is growing! New members joining from across South Africa.

Early access is free. Our community is warm and welcoming.

🌸 rebloomsa.co.za #RebloomSA #JoinUs`,
    image_query: 'growth flowers blooming spring',
  },

  // Wed 26 Feb — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-02-26', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `Every member of Rebloom SA has their own referral code.

When you share your code and someone joins, you're not just growing a platform — you're giving someone the gift of not feeling alone.

Already a member? Find your referral code in your profile and share it today.

Not a member yet? 👉 www.rebloomsa.co.za

🌸 #RebloomSA #ReferAFriend`,
    content_x: null,
    image_query: 'connection sharing gift warmth',
  },

  // Fri 28 Feb — 18:00 — FB + IG + X
  {
    scheduled_at: sast('2026-02-28', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Friday reminder: If you know a widow or widower who's been on your heart lately, this might be the nudge to reach out.

Share Rebloom SA with them. Sometimes the smallest gesture makes the biggest difference.

🌸 www.rebloomsa.co.za

#RebloomSA #BeTheConnection`,
    content_x: `Friday reminder: If you know a widow or widower who's been on your heart, share Rebloom SA with them.

Sometimes the smallest gesture makes the biggest difference.

🌸 rebloomsa.co.za #RebloomSA #BeTheConnection`,
    image_query: 'sunset hope reflection gentle',
  },

  // === WEEK 3 ===
  // Mon 3 Mar — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-03-03', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `"I didn't think I'd find people who understand. Rebloom changed that."

That's the message we hope to hear from every member who joins our community.

Rebloom SA is a private, verified space for widows and widowers in South Africa. No swiping. No algorithms. Just real humans connecting over shared experience.

Ready to take the first step?
👉 www.rebloomsa.co.za

🌸 #RebloomSA #MeaningfulConnections #WidowSupport #SouthAfrica`,
    content_x: `"I didn't think I'd find people who understand. Rebloom changed that."

A verified space for widows & widowers in SA. Real humans. Shared experience.

🌸 rebloomsa.co.za #RebloomSA`,
    image_query: 'warmth community understanding people',
  },

  // Wed 5 Mar — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-03-05', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `Why we personally review every single application to Rebloom SA:

Because safety isn't a feature — it's a promise.

Every person in our community has been verified. Every profile is real. Every conversation happens in a trusted space.

We do this because the people in our community deserve nothing less.

🌸 www.rebloomsa.co.za

#RebloomSA #SafetyFirst #TrustedCommunity #SouthAfrica`,
    content_x: null,
    image_query: 'safety trust shield protection gentle',
  },

  // Fri 7 Mar — 18:00 — FB + IG + X
  {
    scheduled_at: sast('2026-03-07', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Weekends can be lonely when you've lost your person.

If you know that feeling, know that there are people in Rebloom SA who understand exactly what you're going through.

You don't have to navigate this alone.

🌸 www.rebloomsa.co.za

#RebloomSA #YouAreNotAlone #WeekendSupport #SouthAfrica`,
    content_x: `Weekends can be lonely when you've lost your person.

There are people in Rebloom SA who understand exactly what you're going through.

🌸 rebloomsa.co.za #RebloomSA #YouAreNotAlone`,
    image_query: 'evening peace solitude comfort nature',
  },

  // === WEEK 4 ===
  // Mon 10 Mar — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-03-10', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Rebloom SA is growing — and every new member makes this community stronger.

Thank you to everyone who has joined, shared, and believed in what we're building.

If you haven't joined yet, the door is always open.

🌸 www.rebloomsa.co.za

#RebloomSA #GrowingTogether #Community #SouthAfrica`,
    content_x: `Rebloom SA is growing — every new member makes this community stronger.

If you haven't joined yet, the door is always open.

🌸 rebloomsa.co.za #RebloomSA #GrowingTogether`,
    image_query: 'growth blossom tree spring nature',
  },

  // Wed 12 Mar — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-03-12', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `Rebloom SA members are joining from across the country — Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape, and beyond.

No matter where you are in South Africa, there's someone in our community who understands your journey.

🌸 www.rebloomsa.co.za

#RebloomSA #AllProvinces #SouthAfrica #CommunityMatters`,
    content_x: null,
    image_query: 'south africa landscape diverse beautiful',
  },

  // Fri 14 Mar — 18:00 — FB + IG + X
  {
    scheduled_at: sast('2026-03-14', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Help us reach our next milestone — every share, every referral, every conversation brings someone one step closer to not feeling alone.

If Rebloom SA has meant something to you, share it with someone who needs it.

🌸 www.rebloomsa.co.za

#RebloomSA #ShareTheHope #CommunityGoal #SouthAfrica`,
    content_x: `Help us reach our next milestone. Every share brings someone closer to not feeling alone.

If Rebloom SA has meant something to you, share it.

🌸 rebloomsa.co.za #RebloomSA #ShareTheHope`,
    image_query: 'milestone celebration hope flowers',
  },
];

async function main() {
  console.log(`Seeding ${POSTS.length} social posts...`);

  let inserted = 0;
  let skipped = 0;

  for (const post of POSTS) {
    // Idempotent: check if a post already exists at this scheduled_at
    const { data: existing } = await supabase
      .from('social_posts')
      .select('id')
      .eq('scheduled_at', post.scheduled_at)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  SKIP (exists): ${post.scheduled_at} — ${post.content.substring(0, 50)}...`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from('social_posts').insert({
      content: post.content,
      content_x: post.content_x || null,
      platforms: post.platforms,
      scheduled_at: post.scheduled_at,
      image_query: post.image_query || null,
      status: 'pending',
    });

    if (error) {
      console.error(`  FAIL: ${post.scheduled_at} — ${error.message}`);
    } else {
      console.log(`  OK: ${post.scheduled_at} — ${post.content.substring(0, 50)}...`);
      inserted++;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}, Total: ${POSTS.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
