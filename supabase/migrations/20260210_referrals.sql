-- Add referral_code to members (unique short code, assigned on approval)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add referred_by to waitlist (tracks which referral code invited them)
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referred_by TEXT;
