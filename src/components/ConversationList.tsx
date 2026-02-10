import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'

interface Conversation {
  memberId: string
  memberName: string
  memberProvince: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface ConversationListProps {
  activeId: string | null
  onSelect: (memberId: string, memberName: string) => void
  refreshKey: number
}

export default function ConversationList({ activeId, onSelect, refreshKey }: ConversationListProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !user) return

    async function fetchConversations() {
      const { data: messages, error } = await supabase!
        .from('messages')
        .select('id, sender_id, recipient_id, content, read_at, created_at')
        .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
        .order('created_at', { ascending: false })

      if (error || !messages) {
        setLoading(false)
        return
      }

      // Group by conversation partner
      const convMap = new Map<string, { messages: typeof messages }>()
      for (const msg of messages) {
        const partnerId = msg.sender_id === user!.id ? msg.recipient_id : msg.sender_id
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { messages: [] })
        }
        convMap.get(partnerId)!.messages.push(msg)
      }

      // Fetch member details for all partners
      const partnerIds = [...convMap.keys()]
      if (partnerIds.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const { data: members } = await supabase!
        .from('members')
        .select('id, name, province')
        .in('id', partnerIds)

      const memberMap = new Map(members?.map(m => [m.id, m]) ?? [])

      const convList: Conversation[] = partnerIds
        .map(partnerId => {
          const conv = convMap.get(partnerId)!
          const member = memberMap.get(partnerId)
          const latest = conv.messages[0]
          const unreadCount = conv.messages.filter(
            m => m.recipient_id === user!.id && !m.read_at
          ).length

          return {
            memberId: partnerId,
            memberName: member?.name ?? 'Unknown',
            memberProvince: member?.province ?? '',
            lastMessage: latest.content,
            lastMessageAt: latest.created_at,
            unreadCount,
          }
        })
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

      setConversations(convList)
      setLoading(false)
    }

    fetchConversations()
  }, [user, refreshKey])

  if (loading) {
    return <div className="p-4 text-navy/50 text-sm">Loading conversations...</div>
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-navy/50 text-sm">
        No conversations yet. Visit a member's profile to send them a message.
      </div>
    )
  }

  return (
    <div className="divide-y divide-warm-cream-dark">
      {conversations.map(conv => (
        <button
          key={conv.memberId}
          onClick={() => onSelect(conv.memberId, conv.memberName)}
          className={`w-full text-left px-4 py-3 hover:bg-warm-cream transition-colors ${
            activeId === conv.memberId ? 'bg-warm-cream' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-bloom-pink/30 flex items-center justify-center shrink-0">
              <span className="text-sm font-heading font-bold text-terracotta">
                {conv.memberName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading font-semibold text-navy truncate text-sm">
                  {conv.memberName}
                </h3>
                {conv.unreadCount > 0 && (
                  <Badge className="text-xs px-2 py-0.5 shrink-0">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-navy/40 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {conv.memberProvince}
              </span>
              <p className="text-xs text-navy/50 truncate mt-0.5">{conv.lastMessage}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
