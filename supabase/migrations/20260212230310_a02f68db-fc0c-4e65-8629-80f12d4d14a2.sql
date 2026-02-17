
-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'branch_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'kitchen_staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dispatcher';

-- Add store_pause_status to store_settings if not exists
INSERT INTO public.store_settings (key, value)
VALUES ('store_pause', '{"is_paused": false, "pause_until": null, "message_ar": "نعتذر، نحن مغلقون حالياً", "message_en": "Sorry, we are currently closed", "paused_by": null}'::jsonb)
ON CONFLICT (key) DO NOTHING;
