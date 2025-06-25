// File: src/types.ts

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
  tiers: Tier[];
  testimonials: Testimonial[];
};