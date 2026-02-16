import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flower2, LogOut, MessageCircle, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export default function MemberNav() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [memberName, setMemberName] = useState('')
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setIsAdmin(false)
    setMemberName('')
    if (!user) return
    setIsAdmin(user.email === 'hello@rebloomsa.co.za')

    async function fetchName() {
      const { data } = await supabase!
        .from('members')
        .select('name')
        .eq('id', user!.id)
        .single()
      if (data?.name) setMemberName(data.name.split(' ')[0])
    }
    fetchName()
  }, [user?.id])

  useEffect(() => {
    setUnreadCount(0)
    if (!supabase || !user) return

    async function fetchUnread() {
      const { count } = await supabase!
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user!.id)
        .is('read_at', null)
      setUnreadCount(count ?? 0)
    }

    fetchUnread()

    const channel = supabase
      .channel(`unread-badge-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => { fetchUnread() }
      )
      .subscribe()

    return () => { supabase!.removeChannel(channel) }
  }, [user?.id])

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-cream/90 backdrop-blur-md border-b border-warm-cream-dark">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 w-full flex items-center justify-between h-16">
        <a href="/members" className="flex items-center gap-2 text-navy font-heading text-2xl font-bold">
          <Flower2 className="h-7 w-7 text-terracotta" />
          Rebloom SA
        </a>
        <div className="flex items-center gap-2">
          {memberName && (
            <span className="hidden sm:flex items-center gap-1.5 text-sm text-navy/70 font-medium mr-1">
              <User className="h-4 w-4" />
              {memberName}
            </span>
          )}
          <Button variant="ghost" size="sm" className="relative" onClick={() => navigate('/members/messages')}>
            <MessageCircle className="h-4 w-4 mr-1" />
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1.5">
                {unreadCount}
              </span>
            )}
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}
