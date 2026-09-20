-- Normalize projects.status values and lock the vocabulary.
-- App code already compares against 'Fundraising' | 'Coming Soon' | 'Completed';
-- some rows still hold the stray 'Complete' value from manual/CSV edits.

UPDATE public.projects
SET status = 'Completed'
WHERE status = 'Complete';

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('Fundraising', 'Coming Soon', 'Completed'));
