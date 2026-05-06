export const palette = {
  bg: '#0D0D0D',
  bgElevated: '#161616',
  bgCard: '#1C1C1C',
  bgPanel: '#0F0F0F',
  border: '#2A2A2A',
  borderStrong: '#3A3A3A',
  text: '#F5F1E8',
  textMuted: '#9A968B',
  textDim: '#5E5B53',
  success: '#5CCB7A',
  successDim: '#1F3D26',
  danger: '#E8523F',
  dangerDim: '#3D1A14',
  warning: '#E8B23F',
  coin: '#F5C76A',
  overlay: 'rgba(0,0,0,0.6)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type CategoryKey =
  | 'history'
  | 'science'
  | 'space'
  | 'mythology'
  | 'tech'
  | 'biology'
  | 'philosophy';

export const categoryAccents: Record<CategoryKey, { primary: string; soft: string; glow: string; label: string }> = {
  history: { primary: '#E8A33F', soft: '#3D2A14', glow: 'rgba(232,163,63,0.35)', label: 'History' },
  science: { primary: '#3FB6E8', soft: '#142E3D', glow: 'rgba(63,182,232,0.35)', label: 'Science' },
  space: { primary: '#7C5CFF', soft: '#1E163D', glow: 'rgba(124,92,255,0.35)', label: 'Space' },
  mythology: { primary: '#B85CFF', soft: '#2A143D', glow: 'rgba(184,92,255,0.35)', label: 'Mythology' },
  tech: { primary: '#5CFFC4', soft: '#143D33', glow: 'rgba(92,255,196,0.30)', label: 'Tech' },
  biology: { primary: '#5CE85C', soft: '#163D16', glow: 'rgba(92,232,92,0.30)', label: 'Biology' },
  philosophy: { primary: '#E85C8E', soft: '#3D1426', glow: 'rgba(232,92,142,0.35)', label: 'Philosophy' },
};

export const accentFor = (key: string) =>
  categoryAccents[key as CategoryKey] ?? categoryAccents.history;

export const rarityColors = {
  common: palette.textMuted,
  rare: '#7CB7FF',
  legendary: '#FFC85C',
} as const;
