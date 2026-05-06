import { Pressable, Text, StyleSheet, View } from 'react-native';
import { palette, type, radius, space, accentFor } from '@/theme';

type Props = {
  category: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
};

export function CategoryChip({ category, selected = false, onPress, small = false }: Props) {
  const accent = accentFor(category);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.chip,
      small && styles.chipSm,
      selected && { borderColor: accent.primary, backgroundColor: accent.soft },
      pressed && { opacity: 0.6 },
    ]}>
      <View style={[styles.dot, { backgroundColor: accent.primary }]} />
      <Text style={[
        styles.label,
        small && styles.labelSm,
        selected && { color: accent.primary },
      ]}>
        {accent.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.bgElevated,
  },
  chipSm: {
    paddingHorizontal: space.md,
    paddingVertical: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { ...type.label, color: palette.textMuted },
  labelSm: { fontSize: 11, letterSpacing: 0.5 },
});
