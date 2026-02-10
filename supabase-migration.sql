-- Rebloom SA: Member Access & Admin Approval Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Add approval status to waitlist table
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
-- Values: 'pending', 'approved', 'rejected'

-- 2. Create members profile table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  province TEXT NOT NULL,
  age_range TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security on members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: authenticated users can read all profiles, edit only their own
CREATE POLICY "Members can view all profiles"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can update own profile"
  ON public.members
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- 5. Allow service_role to insert members (for admin approval flow)
-- service_role bypasses RLS by default, so no extra policy needed.

-- 6. Grant the service_role full access to waitlist for admin operations
-- (service_role already has full access by default)

-- Done! After running this:
-- 1. Go to Supabase Dashboard → Settings → API
-- 2. Copy the "service_role" key (NOT the anon key)
-- 3. Paste it into your .env file as SUPABASE_SERVICE_ROLE_KEY
