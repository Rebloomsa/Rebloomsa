/**
 * Seed social_posts table with Week 5–11 content (Mar 17 – Apr 30).
 * Sustain phase: Mon/Wed/Fri, 3x per week.
 * Idempotent — checks for existing posts by scheduled_at before inserting.
 * Run: node scripts/seed-social-posts-apr.cjs
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function sast(dateStr, time) {
  return new Date(`${dateStr}T${time}:00+02:00`).toISOString();
}

const POSTS = [
  // === WEEK 5 (Mar 17–21) ===

  // Mon 17 Mar — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-03-17', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Monday morning reminder: You are allowed to laugh again. You are allowed to enjoy things again. You are allowed to live fully — even after loss.

Grief doesn't have a timeline, and neither does healing. But when you're ready to connect with people who understand, Rebloom SA is here.

A verified community for widows and widowers in South Africa.

🌸 www.rebloomsa.co.za

#RebloomSA #MondayMotivation #HealingJourney #SouthAfrica`,
    content_x: `You are allowed to laugh again. To enjoy things again. To live fully — even after loss.

When you're ready, Rebloom SA is here.

🌸 rebloomsa.co.za #RebloomSA #HealingJourney`,
    image_query: 'sunrise morning hope nature south africa',
  },

  // Wed 19 Mar — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-03-19', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `One of the most powerful things about Rebloom SA is this: every single person here knows what it feels like.

No explaining. No awkward silences. No "at least they're in a better place."

Just people who truly understand.

If you've been carrying your grief alone, you don't have to anymore.

🌸 www.rebloomsa.co.za

#RebloomSA #YouAreNotAlone #GriefSupport #SouthAfrica`,
    content_x: null,
    image_query: 'peaceful garden bench solitude comfort',
  },

  // Fri 21 Mar — 18:00 — FB + IG + X (Human Rights Day)
  {
    scheduled_at: sast('2026-03-21', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `This Human Rights Day, we reflect on a right that often goes unspoken: the right to not be alone.

Loneliness after losing a spouse is one of the most overlooked struggles in South Africa. Rebloom SA exists to change that — one connection at a time.

Everyone deserves to be seen. Everyone deserves community.

🌸 www.rebloomsa.co.za

#RebloomSA #HumanRightsDay #SouthAfrica #CommunityMatters`,
    content_x: `This Human Rights Day: the right to not be alone.

Loneliness after loss is one of SA's most overlooked struggles. Rebloom SA exists to change that.

🌸 rebloomsa.co.za #RebloomSA #HumanRightsDay`,
    image_query: 'south africa flag community human rights',
  },

  // === WEEK 6 (Mar 24–28) ===

  // Mon 24 Mar — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-03-24', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Someone asked me recently: "Why did you build Rebloom SA?"

The honest answer? Because I watched my mother eat dinner alone for the first time in 30 years. And I knew there had to be others going through the same thing.

Rebloom exists because no one should face that empty chair without knowing there are people who understand.

🌸 www.rebloomsa.co.za

#RebloomSA #WhyRebloom #FounderStory #SouthAfrica`,
    content_x: `"Why did you build Rebloom SA?"

Because I watched my mother eat dinner alone for the first time in 30 years.

No one should face that without knowing others understand.

🌸 rebloomsa.co.za #RebloomSA`,
    image_query: 'dinner table warm light home comfort',
  },

  // Wed 26 Mar — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-03-26', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `What our members are saying:

"I was nervous to join, but everyone here just gets it. I don't have to explain myself."

"For the first time in two years, I feel like someone actually understands."

"It's not about replacing anyone. It's about not being invisible anymore."

If these words resonate, Rebloom SA was built for you.

🌸 www.rebloomsa.co.za

#RebloomSA #MemberStories #Connection #SouthAfrica`,
    content_x: null,
    image_query: 'people talking community warmth coffee',
  },

  // Fri 28 Mar — 18:00 — FB + IG + X
  {
    scheduled_at: sast('2026-03-28', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `This weekend, if you find yourself scrolling through old photos or sitting in a quiet house — know that thousands of South Africans feel exactly the same way.

You are not broken. You are not weak. You are human.

And there is a community waiting for you when you're ready.

🌸 www.rebloomsa.co.za

#RebloomSA #WeekendThoughts #YouAreNotAlone #SouthAfrica`,
    content_x: `If you find yourself in a quiet house this weekend — thousands of South Africans feel the same way.

You're not alone. There's a community waiting.

🌸 rebloomsa.co.za #RebloomSA #YouAreNotAlone`,
    image_query: 'window light peaceful home gentle',
  },

  // === WEEK 7 (Mar 31 – Apr 4) ===

  // Mon 31 Mar — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-03-31', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `New month. New beginnings.

April is a month of autumn in South Africa — leaves changing, seasons turning. A reminder that change is natural, even when it's hard.

If you've been thinking about joining Rebloom SA, let this be your sign. The community is growing, the conversations are real, and the door is always open.

🌸 www.rebloomsa.co.za

#RebloomSA #NewMonth #NewBeginnings #SouthAfrica`,
    content_x: `New month. New beginnings.

If you've been thinking about joining Rebloom SA, let this be your sign.

🌸 rebloomsa.co.za #RebloomSA #NewBeginnings`,
    image_query: 'autumn leaves south africa nature change',
  },

  // Wed 2 Apr — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-04-02', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `Did you know? Every member of Rebloom SA has been personally reviewed and verified.

We do this because trust isn't optional — it's everything.

In a world of fake profiles and empty promises, Rebloom is a space where you know every person is real, every story is genuine, and every conversation is safe.

🌸 www.rebloomsa.co.za

#RebloomSA #TrustMatters #VerifiedCommunity #SouthAfrica`,
    content_x: null,
    image_query: 'trust handshake safety community',
  },

  // Fri 4 Apr — 18:00 — FB + IG + X
  {
    scheduled_at: sast('2026-04-04', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `A message for anyone who has lost a spouse and doesn't know where to turn:

You don't need to have it all figured out. You don't need to be "over it." You don't need to be strong all the time.

You just need to know that you're not the only one. And at Rebloom SA, you'll find that you're not.

🌸 www.rebloomsa.co.za

#RebloomSA #GriefIsNotLinear #HopeAfterLoss #SouthAfrica`,
    content_x: `You don't need to have it figured out. You don't need to be "over it."

You just need to know you're not the only one.

🌸 rebloomsa.co.za #RebloomSA #HopeAfterLoss`,
    image_query: 'hope light through clouds nature gentle',
  },

  // === WEEK 8 (Apr 7–11) ===

  // Mon 7 Apr — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-04-07', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Behind every Rebloom SA member is a love story.

A love so deep that its absence reshaped their entire world. That's not weakness — that's the mark of something beautiful.

We honour those stories here. Every single one.

🌸 www.rebloomsa.co.za

#RebloomSA #LoveAndLoss #HonouringMemory #SouthAfrica`,
    content_x: `Behind every Rebloom SA member is a love story.

A love so deep that its absence reshaped their world. That's not weakness — that's something beautiful.

🌸 rebloomsa.co.za #RebloomSA #LoveAndLoss`,
    image_query: 'candle memory gentle warm light',
  },

  // Wed 9 Apr — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-04-09', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `Three things we believe at Rebloom SA:

1. Grief is not something to "get over." It's something to carry — together.
2. Connection after loss is not betrayal. It's survival.
3. Every widow and widower in South Africa deserves a space where they belong.

If you believe these things too, you belong here.

🌸 www.rebloomsa.co.za

#RebloomSA #OurValues #CommunityFirst #SouthAfrica`,
    content_x: null,
    image_query: 'three pillars community values together',
  },

  // Fri 11 Apr — 18:00 — FB + IG + X
  {
    scheduled_at: sast('2026-04-11', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `"I joined Rebloom because I was tired of people telling me to move on. Here, no one says that. They just say: 'I understand.'"

That's the power of a community built on shared experience.

If you've been looking for people who get it, we're here.

🌸 www.rebloomsa.co.za

#RebloomSA #SharedExperience #YouBelongHere #SouthAfrica`,
    content_x: `"I was tired of people telling me to move on. At Rebloom, no one says that. They just say: 'I understand.'"

🌸 rebloomsa.co.za #RebloomSA #YouBelongHere`,
    image_query: 'embrace understanding empathy people warmth',
  },

  // === WEEK 9 (Apr 14–18) ===

  // Mon 14 Apr — 08:00 — FB + IG + X
  {
    scheduled_at: sast('2026-04-14', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `This week is about gratitude.

Thank you to every member who took a chance and joined Rebloom SA. Thank you to every person who shared our link with someone who needed it. Thank you to every friend, family member, or pastor who passed on our name.

This community exists because of you.

🌸 www.rebloomsa.co.za

#RebloomSA #Gratitude #CommunityLove #SouthAfrica`,
    content_x: `This week is about gratitude.

Thank you to every member, every share, every person who believed in Rebloom SA.

This community exists because of you.

🌸 rebloomsa.co.za #RebloomSA #Gratitude`,
    image_query: 'gratitude thankful heart flowers gentle',
  },

  // Wed 16 Apr — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-04-16', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `Something we hear often: "I wish I'd found Rebloom sooner."

If you know a widow or widower — a parent, neighbour, colleague, church member — please share this with them. Sometimes the people who need community the most are the ones who won't ask for it.

Your share could be the thing that changes their week, their month, their year.

🌸 www.rebloomsa.co.za

#RebloomSA #ShareThisPost #BeTheConnection #SouthAfrica`,
    content_x: null,
    image_query: 'sharing caring hands passing forward',
  },

  // Fri 18 Apr — 18:00 — FB + IG + X (Good Friday)
  {
    scheduled_at: sast('2026-04-18', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `This Good Friday, we hold space for everyone carrying grief during the Easter season.

Holidays can magnify the absence of someone you love. The empty seat at the table, the tradition that doesn't feel the same.

If that's you today — you are seen. You are not forgotten.

Wishing all our members and their families a peaceful Easter.

🌸 www.rebloomsa.co.za

#RebloomSA #GoodFriday #Easter #SouthAfrica`,
    content_x: `Holidays can magnify the absence of someone you love.

If that's you this Good Friday — you are seen. You are not forgotten.

Peaceful Easter to all.

🌸 rebloomsa.co.za #RebloomSA #GoodFriday`,
    image_query: 'easter cross peaceful sunrise hope',
  },

  // === WEEK 10 (Apr 21–25) ===

  // Mon 21 Apr — 08:00 — FB + IG + X (Family Day)
  {
    scheduled_at: sast('2026-04-21', '08:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `Happy Family Day, South Africa.

Family looks different for everyone — and it changes shape when you lose someone central to it.

Today, we celebrate the families we've built, the ones we've lost, and the new connections that help us feel whole again.

To our Rebloom SA family: you matter.

🌸 www.rebloomsa.co.za

#RebloomSA #FamilyDay #SouthAfrica #CommunityIsFamily`,
    content_x: `Happy Family Day. Family looks different for everyone — especially after loss.

To our Rebloom SA family: you matter.

🌸 rebloomsa.co.za #RebloomSA #FamilyDay`,
    image_query: 'family gathering warmth south africa',
  },

  // Wed 23 Apr — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-04-23', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `Rebloom SA isn't just an app. It's a promise.

A promise that you will be treated with dignity. That your story matters. That your privacy is sacred. That you will never be sold to or exploited.

We built this the way we'd want it built for our own parents. With care, with intention, and with love.

🌸 www.rebloomsa.co.za

#RebloomSA #OurPromise #BuiltWithCare #SouthAfrica`,
    content_x: null,
    image_query: 'promise care heart gentle hands',
  },

  // Fri 25 Apr — 18:00 — FB + IG + X
  {
    scheduled_at: sast('2026-04-25', '18:00'),
    platforms: ['facebook', 'instagram', 'twitter'],
    content: `As we head into the last weekend of April, a gentle reminder:

It's okay to have good days. It's okay to have bad days. It's okay to have days where you feel both at the same time.

Whatever kind of day you're having, you have a place at Rebloom SA.

🌸 www.rebloomsa.co.za

#RebloomSA #ItsOkay #GriefAndGrace #SouthAfrica`,
    content_x: `It's okay to have good days. Bad days. Days where you feel both.

Whatever kind of day, you have a place at Rebloom SA.

🌸 rebloomsa.co.za #RebloomSA #ItsOkay`,
    image_query: 'sunset peaceful nature acceptance gentle',
  },

  // === WEEK 11 (Apr 27–30) ===

  // Sun 27 Apr — 10:00 — FB + X (Freedom Day)
  {
    scheduled_at: sast('2026-04-27', '10:00'),
    platforms: ['facebook', 'twitter'],
    content: `Happy Freedom Day, South Africa.

32 years of democracy. A nation built on the belief that every person deserves dignity, belonging, and the freedom to live fully.

At Rebloom SA, we carry that spirit forward — building a community where widows and widowers are free to connect, free to heal, and free to bloom again.

🌸 www.rebloomsa.co.za

#RebloomSA #FreedomDay #SouthAfrica #ProudlySouthAfrican`,
    content_x: `Happy Freedom Day, South Africa.

Every person deserves dignity, belonging, and the freedom to live fully — including after loss.

🌸 rebloomsa.co.za #RebloomSA #FreedomDay`,
    image_query: 'south africa freedom celebration flag',
  },

  // Wed 29 Apr — 12:00 — FB + IG
  {
    scheduled_at: sast('2026-04-29', '12:00'),
    platforms: ['facebook', 'instagram'],
    content: `As April ends and May begins, we want to share something with you:

Rebloom SA started as an idea born from watching one person struggle with loneliness after loss. Today, it's a growing community of real people across South Africa who refuse to let grief have the last word.

Thank you for being part of this story. The best chapters are still being written.

After loss, life doesn't end — it blooms again.

🌸 www.rebloomsa.co.za

#RebloomSA #AfterLossLifeBloomsAgain #GrowingTogether #SouthAfrica`,
    content_x: null,
    image_query: 'blossoming tree spring new growth hope',
  },
];

async function main() {
  console.log(`Seeding ${POSTS.length} social posts (Mar 17 – Apr 30)...`);

  let inserted = 0;
  let skipped = 0;

  for (const post of POSTS) {
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
