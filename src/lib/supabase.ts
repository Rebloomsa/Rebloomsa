import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url-here')
  ? createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'public' },
      global: { headers: { Prefer: 'return=minimal' } },
    })
  : null

export interface WaitlistEntry {
  name: string
  email: string
  province: string
  age_range: string
  story: string
  referred_by?: string
}

export interface NewsletterEntry {
  email: string
}

async function sendEmail(endpoint: string, data: Record<string, string> | NewsletterEntry) {
  try {
    await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    // Email sending is best-effort — don't block the user
    console.warn('Email notification failed (non-blocking)')
  }
}

export async function submitWaitlist(entry: WaitlistEntry) {
  if (!supabase) {
    console.log('Supabase not configured — waitlist entry:', entry)
    return { success: true, demo: true }
  }
  const { referred_by, ...waitlistData } = entry
  const insertData = referred_by ? { ...waitlistData, referred_by } : waitlistData
  const { error } = await supabase.from('waitlist').insert([insertData])
  if (error) {
    if (error.code === '23505') {
      throw new Error("You're already on the waitlist!")
    }
    throw error
  }
  // Send confirmation + notification emails (non-blocking)
  sendEmail('/api/waitlist-email', waitlistData as Record<string, string>)
  return { success: true }
}

export async function getWaitlistCount(): Promise<number> {
  if (!supabase) return 0
  const { data, error } = await supabase.rpc('waitlist_count')
  if (error || data == null) return 0
  return data
}

export async function submitNewsletter(entry: NewsletterEntry) {
  if (!supabase) {
    console.log('Supabase not configured — newsletter entry:', entry)
    return { success: true, demo: true }
  }
  const { error } = await supabase.from('newsletter').insert([entry])
  if (error) {
    if (error.code === '23505') {
      throw new Error("You're already subscribed!")
    }
    throw error
  }
  // Send confirmation + notification emails (non-blocking)
  sendEmail('/api/newsletter-email', entry)
  return { success: true }
}
