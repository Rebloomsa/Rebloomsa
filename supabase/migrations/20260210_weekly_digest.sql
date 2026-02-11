-- Add last_digest_at to members for tracking per-member digest send times
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_digest_at TIMESTAMPTZ;
