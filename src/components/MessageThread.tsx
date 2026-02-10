import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read_at: string | null
  created_at: string
}

interface MessageThreadProps {
  partnerId: string
  partnerName: string
  refreshKey: number
}

export default function MessageThread({ partnerId, partnerName, refreshKey }: MessageThreadProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Fetch messages for this conversation
  useEffect(() => {
    if (!supabase || !user) return

    async function fetchMessages() {
      setLoading(true)
      const { data, error } = await supabase!
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user!.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user!.id})`
        )
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
    }

    fetchMessages()
  }, [user, partnerId, refreshKey])

  // Mark unread messages as read
  useEffect(() => {
    if (!supabase || !user || messages.length === 0) return

    const unreadIds = messages
      .filter(m => m.recipient_id === user.id && !m.read_at)
      .map(m => m.id)

    if (unreadIds.length > 0) {
      supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds)
        .then()
    }
  }, [messages, user])

  // Subscribe to realtime new messages
  useEffect(() => {
    if (!supabase || !user) return

    const channel = supabase
      .channel(`messages-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message
          // Only add if it belongs to this conversation
          const isRelevant =
            (newMsg.sender_id === user.id && newMsg.recipient_id === partnerId) ||
            (newMsg.sender_id === partnerId && newMsg.recipient_id === user.id)

          if (isRelevant) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })

            // Mark as read if we received it
            if (newMsg.recipient_id === user.id) {
              supabase!
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMsg.id)
                .then()
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, partnerId])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-navy/50 text-sm">
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-navy/50 text-sm">
        No messages yet. Say hello to {partnerName}!
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map(msg => {
        const isSent = msg.sender_id === user?.id
        return (
          <div
            key={msg.id}
            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isSent
                  ? 'bg-terracotta text-white rounded-br-md'
                  : 'bg-white text-navy border border-warm-cream-dark rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <p
                className={`text-[10px] mt-1 ${
                  isSent ? 'text-white/60' : 'text-navy/30'
                }`}
              >
                {new Date(msg.created_at).toLocaleTimeString('en-ZA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
