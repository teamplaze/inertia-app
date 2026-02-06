-- 1. Create/Ensure USER_TYPE Type exists
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('fan', 'artist', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update PROJECTS Table (Add missing columns)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 3. Create PROFILES Table (If not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id),
    updated_at timestamp with time zone,
    full_name text,
    avatar_url text,
    stripe_customer_id text,
    user_type public.user_type NOT NULL DEFAULT 'fan'::public.user_type
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create CONTRIBUTIONS Table
CREATE TABLE IF NOT EXISTS public.contributions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    project_id bigint NOT NULL REFERENCES public.projects(id),
    tier_id bigint NOT NULL REFERENCES public.tiers(id),
    amount_paid numeric NOT NULL,
    stripe_payment_intent_id text UNIQUE
);

-- Enable RLS on contributions (SECURITY FIX)
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- 5. Create ARTIST_INVITATIONS Table
CREATE TABLE IF NOT EXISTS public.artist_invitations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    token uuid DEFAULT gen_random_uuid() NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    project_id bigint REFERENCES public.projects(id)
);

-- Enable RLS on artist_invitations (SECURITY FIX)
ALTER TABLE public.artist_invitations ENABLE ROW LEVEL SECURITY;

-- 6. Create PROJECT_MEMBERS Table
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id bigint REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'owner',
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 7. Add Policies (Idempotent)
DO $$ BEGIN
    -- Profiles: Update own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    -- Profiles: Read public (usually needed for displaying backer names)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone') THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    END IF;

    -- Project Members: View own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own project memberships') THEN
        CREATE POLICY "Users can view their own project memberships" ON public.project_members FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add donation_link column to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS donation_link TEXT;