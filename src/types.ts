// File: src/types.ts

export type BudgetLineItem = {
  id: number;
  category_id: number;
  name: string;
  notes: string | null;
  cost: number;
};

export type BudgetCategory = {
  id: number;
  project_id: number;
  name: string;
  // This will hold the nested line items for each category
  budget_line_items: BudgetLineItem[];
};

export type Tier = {
  id: number;
  name: string;
  price: number;
  description: string;
  perks: string[];
  total_slots: number;
  claimed_slots: number;
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
  project_description: string;
  from_the_artist_message: string;
  tiers: Tier[];
  testimonials: Testimonial[];
  // This is the new field for our nested budget data
  budget_categories: BudgetCategory[];
};