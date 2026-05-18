import type { CSSProperties } from 'react';

/**
 * Prism color themes — single source of truth.
 *
 * To add a theme (~2 min):
 * 1. Add id to PrismTheme union
 * 2. Add one entry to PRISM_THEME_TOKENS
 * 3. Add { id, label } to a group in PRISM_THEME_GROUPS
 */

export type PrismTheme =
  | 'green'
  | 'orange'
  | 'red'
  | 'blue'
  | 'purple'
  | 'teal'
  | 'cyan'
  | 'amber'
  | 'pink'
  | 'lime'
  | 'indigo'
  | 'sunset'
  | 'aurora'
  | 'ember'
  | 'frost'
  | 'midnight'
  | 'sakura'
  | 'mint'
  | 'copper'
  | 'grape'
  | 'coral'
  | 'matrix'
  | 'synthwave'
  | 'coffee'
  | 'ocean'
  | 'lavender'
  | 'honey'
  | 'winter'
  | 'spring'
  | 'summer'
  | 'autumn';

export type PrismThemeTokens = {
  accent: string;
  accentLight: string;
  accentDark: string;
  accentSoft: string;
  onAccent: string;
  accentRgb: string;
  bgTint: string;
  desktopGlow: string;
};

export type PrismThemeOption = { id: PrismTheme; label: string };

export type PrismThemeGroup = {
  label: string;
  themes: PrismThemeOption[];
};

export const PRISM_THEME_STORAGE_KEY = 'prism_theme';
export const DEFAULT_PRISM_THEME: PrismTheme = 'green';

export const PRISM_THEME_TOKENS: Record<PrismTheme, PrismThemeTokens> = {
  green: {
    accent: '#90ee90',
    accentLight: '#c8ffd0',
    accentDark: '#5bc75b',
    accentSoft: '#d4ffd4',
    onAccent: '#0a120a',
    accentRgb: '144, 238, 144',
    bgTint: '8, 12, 10',
    desktopGlow: '#1a2a1a',
  },
  orange: {
    accent: '#ff9f43',
    accentLight: '#ffc078',
    accentDark: '#e17055',
    accentSoft: '#ffe0c2',
    onAccent: '#1a0f08',
    accentRgb: '255, 159, 67',
    bgTint: '22, 14, 8',
    desktopGlow: '#2a1a10',
  },
  red: {
    accent: '#ff6b6b',
    accentLight: '#ff8787',
    accentDark: '#ee5253',
    accentSoft: '#ffc9c9',
    onAccent: '#1a0808',
    accentRgb: '255, 107, 107',
    bgTint: '22, 8, 8',
    desktopGlow: '#2a1010',
  },
  blue: {
    accent: '#5b9cff',
    accentLight: '#8ebfff',
    accentDark: '#3d7ae8',
    accentSoft: '#c5dcff',
    onAccent: '#080f1a',
    accentRgb: '91, 156, 255',
    bgTint: '8, 14, 22',
    desktopGlow: '#1a2840',
  },
  purple: {
    accent: '#b388ff',
    accentLight: '#d4b3ff',
    accentDark: '#9b59f5',
    accentSoft: '#e4d4ff',
    onAccent: '#12081a',
    accentRgb: '179, 136, 255',
    bgTint: '14, 8, 22',
    desktopGlow: '#221a35',
  },
  teal: {
    accent: '#2dd4bf',
    accentLight: '#5eead4',
    accentDark: '#14b8a6',
    accentSoft: '#ccfbf1',
    onAccent: '#042f2e',
    accentRgb: '45, 212, 191',
    bgTint: '6, 18, 16',
    desktopGlow: '#0f2a28',
  },
  cyan: {
    accent: '#22d3ee',
    accentLight: '#67e8f9',
    accentDark: '#0891b2',
    accentSoft: '#cffafe',
    onAccent: '#042a33',
    accentRgb: '34, 211, 238',
    bgTint: '6, 16, 22',
    desktopGlow: '#0e2835',
  },
  amber: {
    accent: '#fbbf24',
    accentLight: '#fcd34d',
    accentDark: '#d97706',
    accentSoft: '#fef3c7',
    onAccent: '#1a1408',
    accentRgb: '251, 191, 36',
    bgTint: '20, 16, 6',
    desktopGlow: '#2a2410',
  },
  pink: {
    accent: '#f472b6',
    accentLight: '#f9a8d4',
    accentDark: '#db2777',
    accentSoft: '#fce7f3',
    onAccent: '#1a0812',
    accentRgb: '244, 114, 182',
    bgTint: '22, 8, 16',
    desktopGlow: '#2a1424',
  },
  lime: {
    accent: '#a3e635',
    accentLight: '#d9f99d',
    accentDark: '#65a30d',
    accentSoft: '#ecfccb',
    onAccent: '#141a08',
    accentRgb: '163, 230, 53',
    bgTint: '14, 18, 6',
    desktopGlow: '#222a10',
  },
  indigo: {
    accent: '#818cf8',
    accentLight: '#a5b4fc',
    accentDark: '#4f46e5',
    accentSoft: '#e0e7ff',
    onAccent: '#0a0a1a',
    accentRgb: '129, 140, 248',
    bgTint: '10, 10, 24',
    desktopGlow: '#181830',
  },
  sunset: {
    accent: '#fb923c',
    accentLight: '#fdba74',
    accentDark: '#f472b6',
    accentSoft: '#ffe4d6',
    onAccent: '#1a0c10',
    accentRgb: '251, 146, 60',
    bgTint: '24, 12, 14',
    desktopGlow: '#2a1820',
  },
  aurora: {
    accent: '#34d399',
    accentLight: '#6ee7b7',
    accentDark: '#2dd4bf',
    accentSoft: '#d1fae5',
    onAccent: '#061a14',
    accentRgb: '52, 211, 153',
    bgTint: '6, 18, 14',
    desktopGlow: '#0e2a22',
  },
  ember: {
    accent: '#f97316',
    accentLight: '#fb923c',
    accentDark: '#dc2626',
    accentSoft: '#ffedd5',
    onAccent: '#1a0806',
    accentRgb: '249, 115, 22',
    bgTint: '24, 10, 6',
    desktopGlow: '#2a140c',
  },
  frost: {
    accent: '#93c5fd',
    accentLight: '#e0f2fe',
    accentDark: '#60a5fa',
    accentSoft: '#f0f9ff',
    onAccent: '#0a1420',
    accentRgb: '147, 197, 253',
    bgTint: '10, 16, 24',
    desktopGlow: '#1a2838',
  },
  midnight: {
    accent: '#6366f1',
    accentLight: '#818cf8',
    accentDark: '#312e81',
    accentSoft: '#c7d2fe',
    onAccent: '#060612',
    accentRgb: '99, 102, 241',
    bgTint: '8, 8, 20',
    desktopGlow: '#101028',
  },
  sakura: {
    accent: '#f9a8d4',
    accentLight: '#fbcfe8',
    accentDark: '#ec4899',
    accentSoft: '#fdf2f8',
    onAccent: '#1a0a12',
    accentRgb: '249, 168, 212',
    bgTint: '22, 10, 16',
    desktopGlow: '#2a1822',
  },
  mint: {
    accent: '#6ee7b7',
    accentLight: '#a7f3d0',
    accentDark: '#34d399',
    accentSoft: '#ecfdf5',
    onAccent: '#081a12',
    accentRgb: '110, 231, 183',
    bgTint: '8, 18, 14',
    desktopGlow: '#142a22',
  },
  copper: {
    accent: '#d97706',
    accentLight: '#fbbf24',
    accentDark: '#92400e',
    accentSoft: '#fde68a',
    onAccent: '#1a1008',
    accentRgb: '217, 119, 6',
    bgTint: '20, 12, 6',
    desktopGlow: '#2a1c10',
  },
  grape: {
    accent: '#a855f7',
    accentLight: '#c084fc',
    accentDark: '#7e22ce',
    accentSoft: '#f3e8ff',
    onAccent: '#14081a',
    accentRgb: '168, 85, 247',
    bgTint: '16, 8, 22',
    desktopGlow: '#241830',
  },
  coral: {
    accent: '#fb7185',
    accentLight: '#fda4af',
    accentDark: '#f43f5e',
    accentSoft: '#ffe4e6',
    onAccent: '#1a0a0c',
    accentRgb: '251, 113, 133',
    bgTint: '22, 10, 12',
    desktopGlow: '#2a1418',
  },
  matrix: {
    accent: '#00ff41',
    accentLight: '#7fff9f',
    accentDark: '#00c832',
    accentSoft: '#c8ffd4',
    onAccent: '#020a04',
    accentRgb: '0, 255, 65',
    bgTint: '4, 14, 6',
    desktopGlow: '#0a2010',
  },
  synthwave: {
    accent: '#ff71ce',
    accentLight: '#01cdfe',
    accentDark: '#b967ff',
    accentSoft: '#ffd6f5',
    onAccent: '#120818',
    accentRgb: '255, 113, 206',
    bgTint: '18, 8, 22',
    desktopGlow: '#281430',
  },
  coffee: {
    accent: '#c4a484',
    accentLight: '#e8d5c4',
    accentDark: '#8b6914',
    accentSoft: '#f5ebe0',
    onAccent: '#1a120c',
    accentRgb: '196, 164, 132',
    bgTint: '18, 12, 8',
    desktopGlow: '#241a14',
  },
  ocean: {
    accent: '#38bdf8',
    accentLight: '#7dd3fc',
    accentDark: '#0369a1',
    accentSoft: '#e0f2fe',
    onAccent: '#041018',
    accentRgb: '56, 189, 248',
    bgTint: '6, 14, 22',
    desktopGlow: '#0c2438',
  },
  lavender: {
    accent: '#c4b5fd',
    accentLight: '#ddd6fe',
    accentDark: '#8b5cf6',
    accentSoft: '#ede9fe',
    onAccent: '#100a1a',
    accentRgb: '196, 181, 253',
    bgTint: '14, 10, 22',
    desktopGlow: '#201830',
  },
  honey: {
    accent: '#facc15',
    accentLight: '#fde047',
    accentDark: '#ca8a04',
    accentSoft: '#fef9c3',
    onAccent: '#1a1606',
    accentRgb: '250, 204, 21',
    bgTint: '20, 18, 6',
    desktopGlow: '#2a2810',
  },
  winter: {
    accent: '#bae6fd',
    accentLight: '#f0f9ff',
    accentDark: '#7dd3fc',
    accentSoft: '#e0f2fe',
    onAccent: '#0c141a',
    accentRgb: '186, 230, 253',
    bgTint: '12, 18, 24',
    desktopGlow: '#1a2a38',
  },
  spring: {
    accent: '#86efac',
    accentLight: '#bbf7d0',
    accentDark: '#4ade80',
    accentSoft: '#dcfce7',
    onAccent: '#0a1a0e',
    accentRgb: '134, 239, 172',
    bgTint: '10, 18, 12',
    desktopGlow: '#1a2a1e',
  },
  summer: {
    accent: '#fde047',
    accentLight: '#fef08a',
    accentDark: '#f97316',
    accentSoft: '#fef9c3',
    onAccent: '#1a1406',
    accentRgb: '253, 224, 71',
    bgTint: '22, 18, 6',
    desktopGlow: '#2a2818',
  },
  autumn: {
    accent: '#ea580c',
    accentLight: '#fb923c',
    accentDark: '#a16207',
    accentSoft: '#ffedd5',
    onAccent: '#1a0c06',
    accentRgb: '234, 88, 12',
    bgTint: '22, 12, 6',
    desktopGlow: '#2a180c',
  },
};

export const PRISM_THEME_GROUPS: PrismThemeGroup[] = [
  {
    label: 'Core',
    themes: [
      { id: 'green', label: 'Green' },
      { id: 'orange', label: 'Orange' },
      { id: 'red', label: 'Red' },
      { id: 'blue', label: 'Blue' },
      { id: 'purple', label: 'Purple' },
    ],
  },
  {
    label: 'Spectrum',
    themes: [
      { id: 'teal', label: 'Teal' },
      { id: 'cyan', label: 'Cyan' },
      { id: 'amber', label: 'Amber' },
      { id: 'pink', label: 'Pink' },
      { id: 'lime', label: 'Lime' },
      { id: 'indigo', label: 'Indigo' },
    ],
  },
  {
    label: 'Moods',
    themes: [
      { id: 'sunset', label: 'Sunset' },
      { id: 'aurora', label: 'Aurora' },
      { id: 'ember', label: 'Ember' },
      { id: 'frost', label: 'Frost' },
      { id: 'midnight', label: 'Midnight' },
      { id: 'sakura', label: 'Sakura' },
      { id: 'mint', label: 'Mint' },
      { id: 'copper', label: 'Copper' },
      { id: 'grape', label: 'Grape' },
      { id: 'coral', label: 'Coral' },
    ],
  },
  {
    label: 'Playful',
    themes: [
      { id: 'matrix', label: 'Matrix' },
      { id: 'synthwave', label: 'Synthwave' },
      { id: 'coffee', label: 'Coffee' },
      { id: 'ocean', label: 'Ocean' },
      { id: 'lavender', label: 'Lavender' },
      { id: 'honey', label: 'Honey' },
    ],
  },
  {
    label: 'Seasons',
    themes: [
      { id: 'winter', label: 'Winter' },
      { id: 'spring', label: 'Spring' },
      { id: 'summer', label: 'Summer' },
      { id: 'autumn', label: 'Autumn' },
    ],
  },
];

/** Flat list (validation, tests). */
export const PRISM_THEMES: PrismThemeOption[] = PRISM_THEME_GROUPS.flatMap((g) => g.themes);

const VALID_THEMES = new Set<PrismTheme>(PRISM_THEMES.map((t) => t.id));

export function isPrismTheme(value: string): value is PrismTheme {
  return VALID_THEMES.has(value as PrismTheme);
}

export function getStoredPrismTheme(): PrismTheme {
  try {
    const raw = localStorage.getItem(PRISM_THEME_STORAGE_KEY);
    if (raw && isPrismTheme(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_PRISM_THEME;
}

export function setStoredPrismTheme(theme: PrismTheme): void {
  localStorage.setItem(PRISM_THEME_STORAGE_KEY, theme);
}

export function prismThemeStyle(theme: PrismTheme): CSSProperties {
  const t = PRISM_THEME_TOKENS[theme];
  return {
    '--prism-accent': t.accent,
    '--prism-accent-light': t.accentLight,
    '--prism-accent-dark': t.accentDark,
    '--prism-accent-soft': t.accentSoft,
    '--prism-on-accent': t.onAccent,
    '--prism-accent-rgb': t.accentRgb,
    '--prism-bg-tint': t.bgTint,
    '--prism-desktop-glow': t.desktopGlow,
  } as CSSProperties;
}
