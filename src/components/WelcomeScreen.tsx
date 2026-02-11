import { useNavigate } from 'react-router-dom'
import { Flower2, Users, MessageCircle, UserCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface WelcomeScreenProps {
  onDismiss: () => void
}

export default function WelcomeScreen({ onDismiss }: WelcomeScreenProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [memberName, setMemberName] = useState('')

  useEffect(() => {
    if (!supabase || !user) return
    supabase
      .from('members')
      .select('name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.name) setMemberName(data.name.split(' ')[0])
      })
  }, [user])

  function handleAction(action: 'profile' | 'directory' | 'messages') {
    localStorage.setItem('rebloom_welcomed', '1')
    if (action === 'profile' && user) {
      navigate(`/members/profile/${user.id}`)
    } else if (action === 'messages') {
      navigate('/members/messages')
    } else {
      onDismiss()
    }
  }

  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Flower2 className="h-12 w-12 text-terracotta mx-auto mb-4" />
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-3">
            Welcome{memberName ? `, ${memberName}` : ''}
          </h1>
          <p className="text-navy/60 text-lg leading-relaxed max-w-md mx-auto">
            You've joined a small community of people who understand
            what it means to lose a life partner.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-warm-cream-dark p-8">
          <p className="text-navy/70 text-center mb-8 leading-relaxed">
            There's no pressure here. No timeline. Just people who get it.
            <br />
            Here are a few things you can do to get started:
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleAction('profile')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-warm-cream-dark hover:border-terracotta/30 hover:bg-warm-cream/50 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-bloom-pink/20 flex items-center justify-center shrink-0 group-hover:bg-bloom-pink/30 transition-colors">
                <UserCircle className="h-5 w-5 text-terracotta" />
              </div>
              <div>
                <p className="font-heading font-semibold text-navy text-sm">
                  Check your profile
                </p>
                <p className="text-navy/50 text-xs mt-0.5">
                  See how you appear to other members
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAction('directory')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-warm-cream-dark hover:border-terracotta/30 hover:bg-warm-cream/50 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-bloom-pink/20 flex items-center justify-center shrink-0 group-hover:bg-bloom-pink/30 transition-colors">
                <Users className="h-5 w-5 text-terracotta" />
              </div>
              <div>
                <p className="font-heading font-semibold text-navy text-sm">
                  Browse the directory
                </p>
                <p className="text-navy/50 text-xs mt-0.5">
                  See who else is here and find people near you
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAction('messages')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-warm-cream-dark hover:border-terracotta/30 hover:bg-warm-cream/50 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-bloom-pink/20 flex items-center justify-center shrink-0 group-hover:bg-bloom-pink/30 transition-colors">
                <MessageCircle className="h-5 w-5 text-terracotta" />
              </div>
              <div>
                <p className="font-heading font-semibold text-navy text-sm">
                  Check your messages
                </p>
                <p className="text-navy/50 text-xs mt-0.5">
                  You may already have a welcome message waiting
                </p>
              </div>
            </button>
          </div>

          <p className="text-center text-navy/40 text-xs mt-8">
            Take your time. We're glad you're here.
          </p>
        </div>
      </div>
    </div>
  )
}
