import { View, Text, StyleSheet } from 'react-native';
import { palette, type, space, accentFor, categoryAccents } from '@/theme';
import type { CategoryStat } from '@/data/types';

type Props = {
  stats: Record<string, CategoryStat>;
};

export function CategoryBarChart({ stats }: Props) {
  const cats = Object.keys(categoryAccents) as Array<keyof typeof categoryAccents>;
  const max = Math.max(
    1,
    ...cats.map((c) => stats[c]?.seen ?? 0),
  );
  return (
    <View style={styles.root}>
      {cats.map((c) => {
        const stat = stats[c] ?? { seen: 0, correct: 0 };
        const accent = accentFor(c);
        const seenWidth = (stat.seen / max) * 100;
        const correctWidth = stat.seen === 0 ? 0 : (stat.correct / stat.seen) * seenWidth;
        return (
          <View key={c} style={styles.row}>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: accent.primary }]} />
              <Text style={styles.label}>{accent.label}</Text>
              <Text style={styles.count}>
                {stat.correct} / {stat.seen}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.seen, { width: `${seenWidth}%`, backgroundColor: accent.soft }]} />
              <View
                style={[styles.correct, { width: `${correctWidth}%`, backgroundColor: accent.primary }]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.md },
  row: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { ...type.label, color: palette.text, flex: 1, textTransform: 'none' },
  count: { ...type.labelSm, color: palette.textMuted, fontVariant: ['tabular-nums'] },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.bgElevated,
    overflow: 'hidden',
  },
  seen: { height: '100%', position: 'absolute', left: 0, top: 0, opacity: 0.7 },
  correct: { height: '100%' },
});
