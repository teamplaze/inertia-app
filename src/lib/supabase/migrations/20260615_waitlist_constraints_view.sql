-- ============================================================
-- Migration: waitlist dedup indexes, admin RLS, email-list view
-- ============================================================

-- 1. Unique indexes on waitlist
--    NULL != NULL in Postgres, so a single UNIQUE constraint on
--    (project_id, tier_id, email) would allow duplicate "general" rows
--    where tier_id IS NULL. Two partial indexes handle both cases cleanly.

-- When tier is specified — one signup per (project, tier, email)
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_project_tier_email_uidx
  ON public.waitlist (project_id, tier_id, email)
  WHERE tier_id IS NOT NULL;

-- When no tier — one "general" signup per (project, email)
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_project_email_no_tier_uidx
  ON public.waitlist (project_id, email)
  WHERE tier_id IS NULL;

-- 2. Admin read policy for waitlist
--    Pattern matches the existing "Public profiles are viewable by everyone"
--    style: a DO block guards idempotency.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'waitlist'
      AND policyname = 'Admins can view all waitlist entries'
  ) THEN
    CREATE POLICY "Admins can view all waitlist entries"
      ON public.waitlist FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND user_type = 'admin'
        )
      );
  END IF;
END $$;

-- 3. waitlist_email_list view
--    Joins waitlist with profiles so display names are pre-resolved.
--    Used by the GET /api/waitlist admin endpoint for email blasts.
CREATE OR REPLACE VIEW public.waitlist_email_list AS
SELECT
  w.id,
  w.project_id,
  w.tier_id,
  w.email,
  w.user_id,
  w.created_at,
  p.full_name AS display_name
FROM public.waitlist w
LEFT JOIN public.profiles p ON p.id = w.user_id;
