
-- Create visitor_sessions table for real-time visitor tracking
CREATE TABLE public.visitor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  current_page text NOT NULL DEFAULT '/',
  page_title text,
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_mobile boolean DEFAULT false,
  referrer text,
  user_agent text
);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/update their own session (by session_id - validated in app)
CREATE POLICY "Anyone can insert visitor sessions"
  ON public.visitor_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update visitor sessions"
  ON public.visitor_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only admins can read all sessions
CREATE POLICY "Admins can view all visitor sessions"
  ON public.visitor_sessions
  FOR SELECT
  USING (is_admin());

-- Allow cleanup of old sessions
CREATE POLICY "Anyone can delete old sessions"
  ON public.visitor_sessions
  FOR DELETE
  USING (last_seen < now() - interval '10 minutes');

-- Enable realtime for visitor_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_sessions;

-- Index for performance
CREATE INDEX idx_visitor_sessions_last_seen ON public.visitor_sessions(last_seen);
CREATE INDEX idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);
