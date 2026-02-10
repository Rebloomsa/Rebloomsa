CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_recipient ON public.messages(recipient_id, created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, recipient_id, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can send messages (insert where they are the sender)
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Users can mark messages as read (update read_at on received messages)
CREATE POLICY "Users can mark received messages read" ON public.messages
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- Enable Realtime on the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
