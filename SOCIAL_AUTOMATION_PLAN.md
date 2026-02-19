# Rebloom SA — Social Media Automation Plan
## FAIL-SAFE EDITION | February 2026

---

## 1. SYSTEM OVERVIEW

**Goal:** Automatically post branded content to Facebook, Instagram, and X (Twitter) on a schedule — with zero risk of off-brand, broken, or lost posts.

**Architecture:**
```
server/social/
├── scheduler.cjs        ← node-cron job scheduler (runs inside existing Express server)
├── brand-guard.cjs      ← validates EVERY post before it touches an API
├── platforms/
│   ├── facebook.cjs     ← Meta Graph API (Pages)
│   ├── instagram.cjs    ← Meta Graph API (IG Business)
│   └── twitter.cjs      ← X API v2 (Free tier)
├── hashtags.cjs         ← rotating hashtag sets per platform
├── images.cjs           ← Pexels API image fetcher + local fallback
├── content-queue.cjs    ← reads from Supabase `social_posts` table
├── retry.cjs            ← exponential backoff retry logic
├── recovery.cjs         ← missed post detection + catch-up on restart
└── reporter.cjs         ← daily summary email to admin
```

**Runs on:** Existing VPS (91.98.17.171) inside the same Express process via PM2. No new infrastructure needed.

---

## 2. BRAND GUARDRAILS — `brand-guard.cjs`

Every single post passes through this module BEFORE hitting any API. If it fails, the post is **blocked and you are emailed**.

### Required elements (ALL must be present):
| Element | Check |
|---------|-------|
| Link | Post contains `rebloomsa.co.za` |
| Blossom emoji | Post contains 🌸 |
| Brand hashtag | Post contains `#RebloomSA` |
| Tagline proximity | Post OR associated campaign contains "After loss, life doesn't end — it blooms again." |

### Banned words (post is REJECTED if any appear):
```
dating, date, singles, hookup, swipe, match, romance, romantic,
sexy, hot, attractive, looking for love, find love, meet singles,
urgent, limited time, act now, don't miss, last chance, FOMO,
buy now, discount, sale, offer, deal, promo, subscribe now,
100% guaranteed, risk-free, no obligation
```

### Banned patterns:
- ALL CAPS words (more than 2 consecutive caps words)
- More than 3 exclamation marks total
- Any URL that is NOT rebloomsa.co.za
- Any mention of competitor platforms

### What happens on rejection:
1. Post is NOT published
2. Admin receives email: "BLOCKED POST: [reason] — [post preview]"
3. Post status set to `blocked` in database with rejection reason
4. Post content preserved for manual review/edit

---

## 3. HASHTAG STRATEGY — `hashtags.cjs`

### Platform limits (2025/2026 algorithm rules):
| Platform | Max hashtags | Sweet spot |
|----------|-------------|------------|
| Instagram | 5 | 3–5 |
| Facebook | 10 | 3–5 |
| X (Twitter) | 3 | 1–2 |

### Rotating hashtag sets (A–E):
Every set has `#RebloomSA` as permanent anchor. Sets rotate daily to avoid algorithm spam detection.

**Set A — Grief & Healing:**
```
#RebloomSA #GriefSupport #HealingJourney #WidowStrong #SouthAfrica
```

**Set B — Community & Connection:**
```
#RebloomSA #WidowCommunity #FindConnection #YouAreNotAlone #MzansiCommunity
```

**Set C — Hope & Renewal:**
```
#RebloomSA #AfterLossLifeBloomsAgain #HopeAfterLoss #NewBeginnings #LifeAfterLoss
```

**Set D — SA Local:**
```
#RebloomSA #SouthAfrica #Mzansi #ProudlySouthAfrican #CommunityMatters
```

**Set E — Awareness & Sharing:**
```
#RebloomSA #WidowsOfSouthAfrica #ShareToHelp #EndLoneliness #SupportEachOther
```

### Rotation logic:
```javascript
const today = new Date();
const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
const setIndex = dayOfYear % 5; // cycles A→B→C→D→E→A...
```

### Platform-specific formatting:
- **Instagram:** All 5 hashtags, placed AFTER a line break at end of caption
- **Facebook:** Top 3–5 from the set, inline at end of post
- **X:** Only `#RebloomSA` + 1 contextual tag (keep tweets clean)

---

## 4. OPTIMISED POSTING TIMES — SAST (UTC+2)

Research-backed SA engagement windows:

| Slot | Time (SAST) | Platform | Why |
|------|-------------|----------|-----|
| Morning | 06:00 | Instagram | Pre-work scroll peak |
| Mid-morning | 10:30 | Facebook | Office break engagement |
| Lunch | 12:00 | All | Universal lunch scroll |
| Commute | 17:00 | X (Twitter) | After-work news catch-up |
| Evening | 18:30 | Instagram | Post-dinner scroll peak |

### Weekly schedule (sustain phase):
| Day | Time | Platforms | Content type |
|-----|------|-----------|-------------|
| Monday | 06:00 | IG | Motivational quote / hope |
| Monday | 10:30 | FB | Community update / milestone |
| Wednesday | 12:00 | FB + IG + X | Core content (stories, values, CTA) |
| Friday | 17:00 | X | Weekend reflection / share CTA |
| Friday | 18:30 | IG + FB | Emotional / personal story |
| Sunday | 10:00 | FB | Faith-friendly / reflection |

---

## 5. CONTENT QUEUE — Supabase `social_posts` table

### Schema:
```sql
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  content_x TEXT,                          -- shortened version for X (optional)
  platforms TEXT[] NOT NULL,               -- ['facebook', 'instagram', 'twitter']
  scheduled_at TIMESTAMPTZ NOT NULL,
  hashtag_set CHAR(1),                    -- A/B/C/D/E or NULL for auto-rotate
  image_query TEXT,                        -- Pexels search term (e.g., "sunrise hope nature")
  image_url TEXT,                          -- override with specific image URL
  status TEXT DEFAULT 'pending',          -- pending | publishing | published | failed | blocked
  fb_post_id TEXT,                        -- returned ID after publish
  ig_post_id TEXT,
  x_post_id TEXT,
  error_log TEXT,                         -- failure details
  retry_count INT DEFAULT 0,
  brand_check_passed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_social_posts_scheduled ON social_posts (scheduled_at)
  WHERE status = 'pending';
CREATE INDEX idx_social_posts_status ON social_posts (status);
```

### Content population:
- Pre-load all Week 1–4 content from `marketing/posting-schedule.md` into this table
- Future content added via a simple admin UI tab (Phase 2) or direct DB insert
- Each row = one "posting event" that fans out to multiple platforms

---

## 6. IMAGE HANDLING — `images.cjs`

### Primary: Pexels API (free, no attribution required for social)
- Search by `image_query` field (e.g., "sunrise south africa hope flowers")
- Curated queries: nature, blossoms, sunrise, community, warmth, gentle light
- Download and cache locally in `server/social/image-cache/`
- Image resized to 1080x1080 (IG square) and 1200x630 (FB/X landscape)

### Fallback chain:
1. **Pexels API** → search + random from top 10 results
2. **Local fallback gallery** → 20 pre-downloaded, brand-approved images in `server/social/fallback-images/`
3. **Text-only post** → if all image sources fail, post without image (still valid on all platforms)
4. **Never block a post** because of an image failure

### Banned image content:
- No images of couples / romance / dating
- No alcohol, parties, nightlife
- Nature, flowers (especially cherry blossoms), sunrises, gentle community scenes only

---

## 7. PLATFORM API INTEGRATION

### Facebook Pages — `platforms/facebook.cjs`
**API:** Meta Graph API v21.0
**Auth:** Page Access Token (long-lived, 60-day rotation)
**Endpoints:**
- `POST /{page-id}/feed` — text post
- `POST /{page-id}/photos` — image + caption post

**Token management:**
- Store token in `.env` as `META_PAGE_ACCESS_TOKEN`
- Token expiry tracker: warn at 53 days, critical at 59 days
- Email admin: "Your Meta token expires in X days — renew now"
- On expired token: queue posts as `pending`, email admin, do NOT retry with bad token

### Instagram Business — `platforms/instagram.cjs`
**API:** Meta Graph API (Instagram Content Publishing)
**Auth:** Same Meta token (needs `instagram_content_publish` permission)
**Flow:**
1. Upload image: `POST /{ig-user-id}/media` with `image_url` + `caption`
2. Publish: `POST /{ig-user-id}/media_publish` with `creation_id`
3. Two-step process — must wait for media container to be ready

**Rate limits:** 25 posts per 24 hours (we'll never hit this)

### X (Twitter) — `platforms/twitter.cjs`
**API:** X API v2 (Free tier)
**Auth:** OAuth 1.0a (API Key + Secret + Access Token + Secret)
**Limits (Free tier):**
- 1,500 tweets per month (we use ~20-30)
- 50 tweets per 24 hours
- Media upload via `POST https://upload.twitter.com/1.1/media/upload.json` (chunked for images)

**Flow:**
1. Upload image to media endpoint → get `media_id`
2. `POST /2/tweets` with `text` + `media.media_ids`

---

## 8. RETRY & RECOVERY — `retry.cjs` + `recovery.cjs`

### Retry logic (per platform, per post):
```
Attempt 1: immediate
Attempt 2: wait 2 minutes
Attempt 3: wait 10 minutes
After 3 failures: mark as FAILED, email admin
```

### Specific error handling:
| Error | Action |
|-------|--------|
| 401/403 (auth) | Do NOT retry. Email admin immediately. Likely token expired. |
| 429 (rate limit) | Wait for `Retry-After` header duration, then retry once. |
| 500/502/503 (server) | Retry with backoff (standard 3 attempts). |
| Network timeout | Retry with backoff. |
| Image upload fail | Retry once, then fall back to text-only post. |
| Brand guard reject | Do NOT retry. Email admin with rejection reason. |

### Recovery on restart (VPS reboot, PM2 restart):
```javascript
// recovery.cjs — runs on server startup
async function recoverMissedPosts() {
  const now = new Date();
  const missedPosts = await supabase
    .from('social_posts')
    .select('*')
    .eq('status', 'pending')
    .lt('scheduled_at', now.toISOString())
    .gte('scheduled_at', new Date(now - 24 * 60 * 60 * 1000).toISOString()); // last 24h only

  for (const post of missedPosts) {
    // Stagger missed posts 5 minutes apart to avoid spam
    await publishPost(post);
    await sleep(5 * 60 * 1000);
  }
}
```

### Absolute last resort — email the content to admin:
If a post fails ALL retries on ALL platforms:
```
Subject: URGENT — Failed social post needs manual publishing
Body: [full post text] [image URL] [intended platforms] [error details]
```
**Nothing is ever lost.** The content always reaches you.

---

## 9. DAILY SUMMARY EMAIL — `reporter.cjs`

**Sent at:** 21:00 SAST daily (via node-cron)
**To:** hello@rebloomsa.co.za

### Email format:
```
Subject: Rebloom Social — Daily Report [19 Feb 2026]

═══════════════════════════════════════
  REBLOOM SA — SOCIAL MEDIA REPORT
  Wednesday, 19 February 2026
═══════════════════════════════════════

TODAY'S POSTS:
  ✅ Facebook  — 12:00 — "Losing a spouse doesn't just..." — Published
  ✅ Instagram — 12:00 — "Losing a spouse doesn't just..." — Published
  ✅ X         — 12:00 — "Losing a spouse doesn't just..." — Published

TOMORROW'S SCHEDULED:
  ⏰ Facebook  — 08:00 — "You might not need Rebloom SA..."
  ⏰ X         — 08:00 — "You might not need Rebloom SA..."

ISSUES (0):
  None — all systems healthy.

META TOKEN STATUS:
  ✅ Valid — expires in 47 days (renew by 7 April)

QUEUE STATUS:
  Pending: 12 posts | Published: 8 | Failed: 0 | Blocked: 0
```

### Alert triggers (sent IMMEDIATELY, not at 21:00):
- Any post fails all 3 retry attempts
- Meta token has fewer than 7 days remaining
- Brand guard blocks a post
- Server restarts and has missed posts to recover

---

## 10. ENVIRONMENT VARIABLES NEEDED

Add to `/root/Rebloomsa/.env`:
```env
# === SOCIAL MEDIA AUTOMATION ===

# Meta (Facebook + Instagram)
META_PAGE_ACCESS_TOKEN=           # Long-lived Page Access Token
META_PAGE_ID=                     # Facebook Page ID
META_IG_USER_ID=                  # Instagram Business Account ID
META_APP_ID=                      # Meta App ID (for token refresh)
META_APP_SECRET=                  # Meta App Secret

# X (Twitter)
X_API_KEY=                        # API Key (Consumer Key)
X_API_SECRET=                     # API Secret (Consumer Secret)
X_ACCESS_TOKEN=                   # Access Token
X_ACCESS_SECRET=                  # Access Token Secret

# Pexels (images)
PEXELS_API_KEY=                   # Free API key from pexels.com

# Social automation settings
SOCIAL_ENABLED=true               # Kill switch — set to false to pause everything
SOCIAL_DRY_RUN=false              # Set to true to test without posting
```

---

## 11. API KEY ACQUISITION CHECKLIST

### Meta (Facebook + Instagram) — takes 1-3 days
1. Go to https://developers.facebook.com
2. Create a new app (type: Business)
3. Add permissions: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`
4. Link the Rebloom SA Facebook Page
5. Link the Rebloom SA Instagram Business account (must be connected to the FB Page)
6. Generate a long-lived Page Access Token (valid 60 days)
7. Note: New apps start in Development mode — submit for App Review for production (takes 1-5 business days)
8. **Alternative for immediate start:** Use a never-expiring Page token via the Graph API Explorer (works immediately for pages you admin)

### X (Twitter) — takes 1-2 days
1. Go to https://developer.x.com
2. Sign up for Free tier ($0/month)
3. Create a project + app
4. Generate API Key + Secret
5. Generate Access Token + Secret (with Read and Write permissions)
6. Free tier allows 1,500 tweets/month — more than enough

### Pexels — instant
1. Go to https://www.pexels.com/api/
2. Sign up (free)
3. Get API key immediately
4. 200 requests/hour, 20,000/month — more than enough

---

## 12. IMPLEMENTATION ORDER

### Phase A — Foundation (Day 1)
1. Create `social_posts` table in Supabase
2. Build `brand-guard.cjs` — test with all existing content
3. Build `hashtags.cjs` — rotation logic + platform formatting
4. Build `retry.cjs` — generic retry wrapper
5. Pre-load Week 1–4 content into `social_posts` table

### Phase B — Platform connectors (Day 2)
1. Build `platforms/facebook.cjs` — post with image
2. Build `platforms/instagram.cjs` — two-step container publish
3. Build `platforms/twitter.cjs` — tweet with media
4. Build `images.cjs` — Pexels fetch + fallback chain
5. Test each platform individually with `SOCIAL_DRY_RUN=true`

### Phase C — Orchestration (Day 3)
1. Build `scheduler.cjs` — node-cron jobs checking `social_posts` table every minute
2. Build `recovery.cjs` — missed post detection on startup
3. Build `reporter.cjs` — daily summary + alert emails
4. Build `content-queue.cjs` — reads pending posts, fans out to platforms
5. Wire into existing `server/index.cjs` — add social routes + startup hook

### Phase D — Go live
1. Run with `SOCIAL_DRY_RUN=true` for 24 hours — verify scheduling, brand checks, email reports
2. Flip to `SOCIAL_DRY_RUN=false` — first real post goes out
3. Monitor daily reports for first week

---

## 13. KILL SWITCHES & SAFETY

| Switch | How | Effect |
|--------|-----|--------|
| Global pause | Set `SOCIAL_ENABLED=false` in .env, restart PM2 | All posting stops. Queue preserved. |
| Dry run | Set `SOCIAL_DRY_RUN=true` | Runs full pipeline but logs instead of posting |
| Single platform disable | Remove platform from post's `platforms` array | Skips that platform only |
| Emergency stop | `pm2 stop rebloomsa-api` | Everything stops immediately |
| Brand guard override | Not possible. There is no override. Brand guard is absolute. | Protects brand always. |

---

## 14. WHAT MAKES THIS FAIL-SAFE

1. **Brand guard has no bypass** — Every post is validated. No exceptions. No override flag. If it doesn't pass, it doesn't post.

2. **Nothing is ever lost** — Failed posts stay in the database. If all retries fail, content is emailed to you. You can always post manually.

3. **Restart recovery** — If the VPS reboots, the server checks for missed posts within the last 24 hours and publishes them with a 5-minute stagger.

4. **Token expiry warnings** — You get warnings at 53, 59, and 60 days before your Meta token expires. No surprise lockouts.

5. **Dry run mode** — Test the entire pipeline without touching real APIs. See exactly what would be posted, when, where, with what hashtags.

6. **Daily accountability** — Every night at 21:00 you know exactly what went out, what failed, and what's coming tomorrow.

7. **Kill switch** — One env variable stops everything. No code changes needed.

8. **Hashtag rotation** — 5 sets cycling daily prevent algorithm spam flags while keeping #RebloomSA as the permanent anchor.

9. **Image fallback chain** — Pexels → local cache → text-only. A missing image never blocks a post.

10. **Platform isolation** — If Facebook is down, Instagram and X still post. Each platform is independent. One failure doesn't cascade.

---

## 15. REBLOOM BRAND LOCK — NON-NEGOTIABLE RULES

These are hardcoded into `brand-guard.cjs` and cannot be changed without editing source code:

| Rule | Enforcement |
|------|-------------|
| Every post links to rebloomsa.co.za | Regex check — blocked if missing |
| Every post has 🌸 | Character check — blocked if missing |
| Every post has #RebloomSA | String check — blocked if missing |
| No dating/sales language | Banned word list — blocked if detected |
| No competitor URLs | URL whitelist (only rebloomsa.co.za allowed) |
| No ALL CAPS screaming | Caps pattern detection — blocked if >2 consecutive caps words |
| Founder voice only | Content pre-approved in queue — no AI-generated posts without review |
| Tagline preserved | "After loss, life doesn't end — it blooms again." appears in every campaign cycle |

---

*Plan created: 19 February 2026*
*For: Rebloom SA social media automation*
*Status: READY TO BUILD — awaiting API keys*
