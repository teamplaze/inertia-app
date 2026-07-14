-- Email marketing sync fields for profiles
-- Shared enum for both Loops and Kit sync status columns
CREATE TYPE email_sync_status AS ENUM ('synced', 'failed', 'pending');

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS loops_contact_id   TEXT,
  ADD COLUMN IF NOT EXISTS loops_sync_status  email_sync_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS loops_synced_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kit_subscriber_id  TEXT,
  ADD COLUMN IF NOT EXISTS kit_sync_status    email_sync_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS kit_synced_at      TIMESTAMPTZ;
