import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Users, MessageCircle } from 'lucide-react'
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
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

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

          <h1 className="font-heading text-3xl font-bold text-navy mb-4">{member.name}</h1>

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
