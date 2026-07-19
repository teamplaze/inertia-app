-- Discord invite link for project communities
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS discord_invite_url TEXT;
