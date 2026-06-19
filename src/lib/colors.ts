export const COLOR = {
  // Base
  black: '#000000',
  white: '#ffffff',

  // Gray scale
  gray50:  '#dbdddd',
  gray100: '#c3c7c7',
  gray200: '#a5abaa',
  gray300: '#888f8e',
  gray400: '#6a7372',
  gray500: '#4c5756',
  gray600: '#3f4948',
  gray700: '#333a39',
  gray800: '#262c2b',
  gray900: '#0f1111',

  // Teal scale
  teal50:  '#d8eae8',
  teal100: '#bfdcd9',
  teal200: '#9ecac6',
  teal300: '#7eb8b4',
  teal400: '#5ea7a1',
  teal500: '#3e958e',
  teal600: '#347c76',
  teal700: '#29635f',
  teal800: '#1f4b47',
  teal900: '#0c1e1c',

  // Orange scale
  orange50:  '#f9e8da',
  orange100: '#f5d9c1',
  orange200: '#f0c6a2',
  orange300: '#ebb384',
  orange400: '#e6a065',
  orange500: '#e18d46',
  orange600: '#bb763a',
  orange700: '#965e2f',
  orange800: '#714723',
  orange900: '#2d1c0e',
} as const;

// Semantic BRAND aliases — what components reference
export const BRAND = {
  // Core
  black:        COLOR.black,
  white:        COLOR.white,

  // Primary accent (orange)
  copper:       COLOR.orange500,
  copperHover:  COLOR.orange600,

  // Secondary accent (teal)
  teal:         COLOR.teal500,
  tealSelected: COLOR.teal600,

  // Backgrounds
  dark:         COLOR.gray800,
  darker:       COLOR.gray900,
  darkA95:      'rgba(38, 44, 43, 0.95)',

  // Functional
  green:        '#22C55E',
} as const;

// Background gradients — used in inline style objects
export const BG = {
  tealSpotlightTop:
    'radial-gradient(125.07% 100% at 50% 0%, #3e958e 0%, #000 37.62%)',
  tealSpotlightBottom:
    'radial-gradient(146.13% 116.83% at 50% -16.83%, #e18d46 0%, #000 50%)',
  orangeSpotlightTop:
    'radial-gradient(125.07% 100% at 50% 0%, #e18d46 0%, #000 37.62%)',
  orangeSpotlightBottom:
    'radial-gradient(146.13% 116.83% at 50% -16.83%, #e18d46 0%, #000 50%)',
  imageBackground:
    'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%), linear-gradient(180deg, rgba(225,141,70,0.50) 0%, rgba(62,149,142,0.50) 57.08%)',
} as const;
