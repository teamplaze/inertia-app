// File: src/types.ts

// --- NEW: Auth & Role Types ---
export type UserType = 'fan' | 'artist' | 'admin';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  stripe_customer_id: string | null;
};

export type ArtistInvitation = {
  id: string;
  email: string;
  token: string;
  used_at: string | null;
  created_at: string;
  expires_at: string;
};

export type BudgetLineItem = {
  id: number;
  category_id: number;
  name: string;
  notes: string | null;
  cost: number;
  milestone_id?: number | null;
};

export type BudgetCategory = {
  id: number;
  project_id: number;
  name: string;
  // This will hold the nested line items for each category
  budget_line_items: BudgetLineItem[];
};

export type ProjectMilestone = {
  id: number;
  title: string;
  sort_order: number;
  budget_line_items: BudgetLineItem[];
};

export type TierPerk = {
  id: string;
  tier_id: string;
  label: string;
  category: string;
  is_exclusive: boolean;
  sort_order: number;
};

export type Tier = {
  id: number;
  name: string;
  price: number;
  description: string;
  perks: TierPerk[];
  total_slots: number;
  claimed_slots: number;
  status: 'upcoming' | 'active' | 'closed';
  sale_start_at: string | null;
  sale_end_at: string | null;
};

export type WaitlistEntry = {
  id: string;
  project_id: string;
  tier_id: string | null;
  email: string;
  user_id: string | null;
  created_at: string;
};

export type Testimonial = {
  id: number;
  name: string;
  location: string;
  profile_image_url: string;
  moment: string;
  date: string;
  story: string;
  verified: boolean;
};

export type Project = {
  id: number;
  created_at: string;
  artist_name: string;
  project_title: string;
  project_image_url: string;
  funding_goal: number;
  current_funding: number;
  status: string;
  artist_profile_image_url: string;
  artist_bio: string;
  audio_preview_url: string;
  backer_count: number;
  artist_message_video_url: string;
  from_the_artist_message: string;
  tiers: Tier[];
  testimonials: Testimonial[];
  slug?: string;
  // This is the new field for our nested budget data
  budget_categories: BudgetCategory[];
    // This is the new field for our milestone gamification data
  project_milestones?: ProjectMilestone[];
  // Added donation_link property
  donation_link?: string;
  // Added spotify_artist_id property
  spotify_artist_id?: string;
  // Per-project color palette (hex strings) — used for budget chart and future theming
  project_colors?: string[] | null;
};