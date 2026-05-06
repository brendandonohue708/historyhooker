import { TextStyle } from 'react-native';

// We rely on system fonts so the app runs in Expo Go with zero font assets to ship.
// On iOS this resolves to SF Pro / New York; on Android to Roboto / Noto Serif.
// Both pair well with the editorial dark tone we're going for.
const display = { fontFamily: 'serif' };
const sans = { fontFamily: 'System' };

export const type = {
  // Display
  hero: { ...display, fontSize: 44, lineHeight: 50, fontWeight: '700', letterSpacing: -1 } as TextStyle,
  title: { ...display, fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.6 } as TextStyle,
  clue: { ...display, fontSize: 28, lineHeight: 36, fontWeight: '600', letterSpacing: -0.3 } as TextStyle,

  // Body
  bodyLg: { ...sans, fontSize: 17, lineHeight: 26, fontWeight: '400' } as TextStyle,
  body: { ...sans, fontSize: 15, lineHeight: 22, fontWeight: '400' } as TextStyle,
  bodySm: { ...sans, fontSize: 13, lineHeight: 18, fontWeight: '400' } as TextStyle,

  // Labels
  labelLg: { ...sans, fontSize: 16, lineHeight: 20, fontWeight: '600', letterSpacing: 0.3 } as TextStyle,
  label: { ...sans, fontSize: 13, lineHeight: 16, fontWeight: '600', letterSpacing: 0.5 } as TextStyle,
  labelSm: { ...sans, fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.2 } as TextStyle,

  // Numbers (coin counters, streak)
  digits: { ...display, fontSize: 22, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2 } as TextStyle,
};
