import { View, Text, StyleSheet } from 'react-native';
import { palette, type } from '@/theme';
import { seedSwag } from '@/data/seed';

const FRAME_TINT: Record<string, string> = {
  'frame-thin': palette.coin,
  'frame-foil': '#C8B9FF',
  'frame-engraved': '#E8C97A',
  'frame-blueprint': '#3FB6E8',
  'frame-amber': '#E8A33F',
  'frame-noir': palette.borderStrong,
  'frame-foundling': '#FFC85C',
};

export function Avatar({
  username,
  frameId,
  size = 96,
}: {
  username: string;
  frameId: string | null;
  size?: number;
}) {
  const initials = username
    ? username
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? '')
        .join('')
    : '?';
  const tint = frameId ? (FRAME_TINT[frameId] ?? palette.borderStrong) : 'transparent';
  const frameItem = frameId ? seedSwag.find((s) => s.id === frameId) : null;
  return (
    <View style={[styles.wrap, { width: size + 12, height: size + 12 }]}>
      <View
        style={[
          styles.frame,
          {
            width: size + 12,
            height: size + 12,
            borderRadius: (size + 12) / 2,
            borderColor: tint,
            borderWidth: frameId ? 2 : 0,
          },
        ]}
      />
      <View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.initials, { fontSize: size / 2.5 }]}>{initials || '·'}</Text>
      </View>
      {frameItem && (
        <Text style={[styles.frameGlyph, { color: tint }]}>{frameItem.previewAsset}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    position: 'absolute',
  },
  avatar: {
    backgroundColor: palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...type.title, color: palette.text },
  frameGlyph: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    fontSize: 14,
  },
});
