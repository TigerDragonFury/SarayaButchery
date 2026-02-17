
-- Audit logs for AI assistant actions
CREATE TABLE public.ai_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, applied, undone, failed
  result_summary TEXT,
  error_message TEXT,
  undo_data JSONB, -- snapshot of previous data for undo
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_at TIMESTAMPTZ,
  undone_at TIMESTAMPTZ
);

ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can access audit logs
CREATE POLICY "Admins can manage ai_audit_logs"
  ON public.ai_audit_logs
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can insert ai_audit_logs"
  ON public.ai_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));
