-- ============================================================
-- Migration: tier_perks table, waitlist table, tiers sale window
-- ============================================================

-- 1. Add sale-window and status columns to tiers
ALTER TABLE public.tiers
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'active', 'closed')),
  ADD COLUMN IF NOT EXISTS sale_start_at timestamptz,
  ADD COLUMN IF NOT EXISTS sale_end_at timestamptz;

-- 2. Create tier_perks table
CREATE TABLE IF NOT EXISTS public.tier_perks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_id bigint NOT NULL REFERENCES public.tiers(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_exclusive boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.tier_perks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tier_perks'
      AND policyname = 'Tier perks are viewable by everyone'
  ) THEN
    CREATE POLICY "Tier perks are viewable by everyone"
      ON public.tier_perks FOR SELECT USING (true);
  END IF;
END $$;

-- 3. Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id bigint NOT NULL REFERENCES public.projects(id),
  tier_id bigint REFERENCES public.tiers(id),
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'waitlist'
      AND policyname = 'Users can view their own waitlist entries'
  ) THEN
    CREATE POLICY "Users can view their own waitlist entries"
      ON public.waitlist FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'waitlist'
      AND policyname = 'Anyone can join the waitlist'
  ) THEN
    CREATE POLICY "Anyone can join the waitlist"
      ON public.waitlist FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 4. Backfill tier_perks from tiers.perks text[]
--    One row per string, is_exclusive=false, sort_order=0-indexed array position.
--    Skips tiers where perks is NULL or empty.
INSERT INTO public.tier_perks (tier_id, label, is_exclusive, sort_order)
SELECT
  t.id            AS tier_id,
  p.label         AS label,
  false           AS is_exclusive,
  (p.ord - 1)::int AS sort_order
FROM public.tiers t,
  LATERAL unnest(t.perks) WITH ORDINALITY AS p(label, ord)
WHERE t.perks IS NOT NULL AND array_length(t.perks, 1) > 0
ON CONFLICT DO NOTHING;
