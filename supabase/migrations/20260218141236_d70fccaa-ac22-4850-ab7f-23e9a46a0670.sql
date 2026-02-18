-- Create the updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create booking_messages table for encrypted chat
CREATE TABLE IF NOT EXISTS public.booking_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL,
  content text NOT NULL,
  content_encrypted boolean NOT NULL DEFAULT true,
  message_type text NOT NULL DEFAULT 'text',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages visible to sender"
  ON public.booking_messages FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Participants can insert messages"
  ON public.booking_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Can mark messages as read"
  ON public.booking_messages FOR UPDATE
  USING (auth.uid() = sender_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_messages;

-- Create call_sessions table for in-app WebRTC signaling
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL,
  caller_id uuid NOT NULL,
  callee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  offer jsonb,
  answer jsonb,
  ice_candidates jsonb DEFAULT '[]'::jsonb,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Call participants can view their sessions"
  ON public.call_sessions FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Callers can create sessions"
  ON public.call_sessions FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Participants can update sessions"
  ON public.call_sessions FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.call_sessions;

CREATE TRIGGER update_call_sessions_updated_at
  BEFORE UPDATE ON public.call_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();