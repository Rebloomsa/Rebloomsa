-- Helper: immutable date extraction for indexing
CREATE OR REPLACE FUNCTION public.viewed_date(ts TIMESTAMPTZ) RETURNS DATE AS $$
  SELECT (ts AT TIME ZONE 'UTC')::date;
$$ LANGUAGE sql IMMUTABLE;

-- Profile view tracking
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON public.profile_views(viewed_id, viewed_at DESC);

-- Deduplicate: one view per viewer per viewed member per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_unique_daily
  ON public.profile_views(viewer_id, viewed_id, public.viewed_date(viewed_at));

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert views (only as themselves)
CREATE POLICY "Users can record views" ON public.profile_views
  FOR INSERT TO authenticated WITH CHECK (viewer_id = auth.uid());

-- Users can see who viewed their own profile
CREATE POLICY "Users can see their own views" ON public.profile_views
  FOR SELECT TO authenticated USING (viewed_id = auth.uid());
