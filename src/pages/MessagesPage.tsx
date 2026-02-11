import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import MemberNav from '@/components/MemberNav'
import ConversationList from '@/components/ConversationList'
import MessageThread from '@/components/MessageThread'
import MessageInput from '@/components/MessageInput'

export default function MessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [activePartnerName, setActivePartnerName] = useState<string>('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Handle ?to=memberId from profile page
  useEffect(() => {
    const toId = searchParams.get('to')
    if (toId && supabase) {
      supabase
        .from('members')
        .select('id, name')
        .eq('id', toId)
        .single()
        .then(({ data }) => {
          if (data) {
            setActivePartnerId(data.id)
            setActivePartnerName(data.name)
          }
        })
    }
  }, [searchParams])

  // Global realtime subscription for conversation list refresh
  useEffect(() => {
    if (!supabase || !user) return

    const channel = supabase
      .channel('messages-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as { sender_id: string; recipient_id: string }
          if (msg.sender_id === user.id || msg.recipient_id === user.id) {
            setRefreshKey(k => k + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(channel)
    }
  }, [user])

  function handleSelectConversation(memberId: string, memberName: string) {
    setActivePartnerId(memberId)
    setActivePartnerName(memberName)
  }

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col">
      <MemberNav />

      {/* Main content */}
      <div className="flex-1 max-w-5xl mx-auto w-full flex overflow-hidden pt-16" style={{ height: '100vh' }}>
        {/* Conversation list - hidden on mobile when a conversation is active */}
        <div
          className={`w-full sm:w-80 sm:border-r border-warm-cream-dark bg-white sm:block ${
            activePartnerId ? 'hidden' : 'block'
          }`}
        >
          <div className="px-4 py-3 border-b border-warm-cream-dark">
            <h2 className="font-heading font-semibold text-navy text-sm">Conversations</h2>
          </div>
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 64px - 49px)' }}>
            <ConversationList
              activeId={activePartnerId}
              onSelect={handleSelectConversation}
              refreshKey={refreshKey}
            />
          </div>
        </div>

        {/* Message thread */}
        <div
          className={`flex-1 flex flex-col bg-warm-cream ${
            activePartnerId ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {activePartnerId ? (
            <>
              {/* Conversation header */}
              <div className="bg-white border-b border-warm-cream-dark px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setActivePartnerId(null)}
                  className="sm:hidden text-terracotta"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-bloom-pink/30 flex items-center justify-center">
                  <span className="text-sm font-heading font-bold text-terracotta">
                    {activePartnerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-navy">{activePartnerName}</h3>
              </div>

              <MessageThread
                partnerId={activePartnerId}
                partnerName={activePartnerName}
                refreshKey={refreshKey}
              />
              <MessageInput
                recipientId={activePartnerId}
                onSent={() => setRefreshKey(k => k + 1)}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-navy/40 text-sm">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
