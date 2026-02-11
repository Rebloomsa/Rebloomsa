import { useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'

interface MessageInputProps {
  recipientId: string
  onSent: () => void
}

export default function MessageInput({ recipientId, onSent }: MessageInputProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!supabase || !user || !content.trim() || sending) return

    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: content.trim(),
      })

    if (!error) {
      setContent('')
      onSent()

      // Fire email notification (non-blocking)
      supabase!
        .from('members')
        .select('name')
        .eq('id', user.id)
        .single()
        .then(({ data: sender }) => {
          if (sender?.name) {
            fetch(`${apiUrl}/api/message-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipientId, senderName: sender.name }),
            }).catch(() => {})
          }
        })
    }
    setSending(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-warm-cream-dark px-4 py-3 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-warm-cream-dark bg-warm-cream px-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-colors"
          disabled={sending}
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="shrink-0 rounded-lg px-3 py-2.5"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
