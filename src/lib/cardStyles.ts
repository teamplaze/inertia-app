import { BRAND } from "./colors";

export const regularCardStyle = {
  backgroundColor: BRAND.teal,
  border: `2px solid ${BRAND.copper}`,
} as const;

export const gradientCardStyle = {
  background: `linear-gradient(180deg, ${BRAND.teal} 0%, #000000 100%)`,
  border: `2px solid ${BRAND.copper}`,
} as const;
