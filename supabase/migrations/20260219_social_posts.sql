-- Rebloom SA: Social Posts Queue Table
-- Run this in Supabase SQL Editor or via scripts/create-social-posts-table.cjs

CREATE TABLE IF NOT EXISTS public.social_posts (
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

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON public.social_posts (scheduled_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_posts (status);

-- Enable RLS (service_role bypasses by default)
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
