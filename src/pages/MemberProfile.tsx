import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Users, MessageCircle, Share2, Copy, Check, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MemberNav from '@/components/MemberNav'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface Member {
  id: string
  name: string
  province: string
  age_range: string
  bio: string | null
  created_at: string
}

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [member, setMember] = useState<(Member & { referral_code?: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const viewRecorded = useRef(false)

  useEffect(() => {
    async function fetchMember() {
      if (!supabase || !id) return
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) setMember(data)
      setLoading(false)
    }
    fetchMember()
  }, [id])

  // Record profile view when viewing someone else's profile
  useEffect(() => {
    if (!supabase || !user || !id || user.id === id || viewRecorded.current) return
    viewRecorded.current = true
    supabase.from('profile_views').insert({
      viewer_id: user.id,
      viewed_id: id,
    }).then(() => {
      // ON CONFLICT handled by unique daily index — ignore errors
    })
  }, [user, id])

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <p className="text-navy/50">Loading profile...</p>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-navy/50 mb-4">Member not found</p>
          <Link to="/members" className="text-terracotta hover:underline">Back to directory</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <MemberNav />
      <main className="max-w-2xl mx-auto px-6 sm:px-8 pt-24 pb-12">

        <div className="bg-white rounded-xl shadow-sm border border-warm-cream-dark p-8">
          {/* Avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-bloom-pink/30 flex items-center justify-center mb-6">
            <span className="text-2xl font-heading font-bold text-terracotta">
              {member.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-heading text-3xl font-bold text-navy">{member.name}</h1>
            {user && user.id === member.id && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/members/edit-profile')}
                className="ml-auto"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-navy/70">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-terracotta" />
              {member.province}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-terracotta" />
              {member.age_range}
            </span>
          </div>

          {member.bio && (
            <div className="border-t border-warm-cream-dark pt-6">
              <h2 className="font-heading text-lg font-semibold text-navy mb-3">About</h2>
              <p className="text-navy/70 leading-relaxed whitespace-pre-wrap">{member.bio}</p>
            </div>
          )}

          {user && user.id !== member.id && (
            <div className="border-t border-warm-cream-dark pt-6 mt-6">
              <Button onClick={() => navigate(`/members/messages?to=${member.id}`)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          )}

          {/* Invite a Friend section — own profile only */}
          {user && user.id === member.id && member.referral_code && (
            <div className="border-t border-warm-cream-dark pt-6 mt-6">
              <h2 className="font-heading text-lg font-semibold text-navy mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-terracotta" />
                Invite a Friend
              </h2>
              <p className="text-sm text-navy/60 mb-3">
                Share your personal invite link. When someone joins through it, you'll be notified.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-warm-cream rounded-lg px-3 py-2 text-sm text-navy break-all">
                  rebloomsa.co.za/?ref={member.referral_code}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = `https://rebloomsa.co.za/?ref=${member.referral_code}`
                    try {
                      const textarea = document.createElement('textarea')
                      textarea.value = url
                      textarea.style.position = 'fixed'
                      textarea.style.opacity = '0'
                      document.body.appendChild(textarea)
                      textarea.select()
                      document.execCommand('copy')
                      document.body.removeChild(textarea)
                    } catch {
                      navigator.clipboard.writeText(url).catch(() => {})
                    }
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  {copied ? <Check className="h-4 w-4 text-hope-green" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join me on Rebloom SA — a community for people rebuilding after loss. Sign up here: https://rebloomsa.co.za/?ref=${member.referral_code}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-hope-green hover:underline font-medium"
              >
                Share on WhatsApp
              </a>
            </div>
          )}

          <p className="text-xs text-navy/30 mt-8">
            Member since {new Date(member.created_at).toLocaleDateString('en-ZA', {
              year: 'numeric', month: 'long'
            })}
          </p>
        </div>
      </main>
    </div>
  )
}
