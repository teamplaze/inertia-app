-- Migration: add category column to tier_perks and backfill from label "Category: Description" convention

ALTER TABLE public.tier_perks
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General';

-- For rows where label contains ':', parse out category and clean the label.
UPDATE public.tier_perks
SET
  category = trim(split_part(label, ':', 1)),
  label    = trim(substring(label from position(':' in label) + 1))
WHERE label LIKE '%:%';
