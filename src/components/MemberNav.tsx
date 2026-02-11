import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flower2, LogOut, MessageCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export default function MemberNav() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.email === 'hello@rebloomsa.co.za') setIsAdmin(true)
  }, [user])

  useEffect(() => {
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
      .channel('unread-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => { fetchUnread() }
      )
      .subscribe()

    return () => { supabase!.removeChannel(channel) }
  }, [user])

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
          <Button variant="ghost" size="sm" onClick={() => navigate('/members/messages')}>
            <MessageCircle className="h-4 w-4 mr-1" />
            Messages
            {unreadCount > 0 && (
              <Badge className="ml-1.5 text-xs px-1.5 py-0">{unreadCount}</Badge>
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
