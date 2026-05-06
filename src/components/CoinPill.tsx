import { View, Text, StyleSheet } from 'react-native';
import { palette, space, radius, type } from '@/theme';

export function CoinPill({ amount, label }: { amount: number; label?: string }) {
  return (
    <View style={styles.pill}>
      <View style={styles.coin} />
      <Text style={styles.amount}>
        {amount.toLocaleString()}
        {label ? <Text style={styles.label}>  {label}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: 4,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
  },
  coin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.coin,
    shadowColor: palette.coin,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  amount: { ...type.label, color: palette.text, fontVariant: ['tabular-nums'] },
  label: { ...type.label, color: palette.textMuted, fontWeight: '400' },
});
