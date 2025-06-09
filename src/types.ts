// src/types.ts

export type Project = {
  id: number;
  artist_name: string;
  project_title: string;
  project_image_url: string;
  current_funding: number;
  funding_goal: number;
  status: string;
  perks_description: string;
};