import { View, Text, StyleSheet } from 'react-native';
import { palette, space, radius, type } from '@/theme';

export function StreakBanner({
  streak,
  dailyRemaining,
}: {
  streak: number;
  dailyRemaining: number;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.streakCol}>
        <Text style={styles.streakNum}>{streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.dailyCol}>
        <Text style={styles.dailyNum}>{dailyRemaining}</Text>
        <Text style={styles.dailyLabel}>topics left today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
  },
  streakCol: { flex: 1, alignItems: 'flex-start' },
  dailyCol: { flex: 1, alignItems: 'flex-end' },
  divider: { width: 1, height: 32, backgroundColor: palette.border },
  streakNum: {
    ...type.title,
    color: palette.coin,
    fontSize: 26,
    lineHeight: 32,
  },
  streakLabel: { ...type.labelSm, color: palette.textMuted, marginTop: 2 },
  dailyNum: {
    ...type.title,
    color: palette.text,
    fontSize: 26,
    lineHeight: 32,
  },
  dailyLabel: { ...type.labelSm, color: palette.textMuted, marginTop: 2 },
});
