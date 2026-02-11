-- Waitlist table: stores signup applications before admin approval
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  province TEXT NOT NULL,
  age_range TEXT NOT NULL,
  story TEXT,
  status TEXT DEFAULT 'pending',
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anonymous inserts (public signup form)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit to waitlist" ON public.waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only service_role can read/update (admin operations via server)
-- service_role bypasses RLS by default, so no extra policy needed.

-- Waitlist count function for landing page
CREATE OR REPLACE FUNCTION public.waitlist_count()
RETURNS INTEGER AS $$
  SELECT count(*)::integer FROM public.waitlist;
$$ LANGUAGE sql SECURITY DEFINER;

-- Newsletter table: email subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
