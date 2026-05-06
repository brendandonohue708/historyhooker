import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Topic } from '@/data/types';
import { accentFor, palette, radius, space, type } from '@/theme';

const clueIcon = (t: Topic['clue']['type']) =>
  t === 'image' ? '◐' : t === 'audio' ? '♫' : '✎';

export function TopicPreviewCard({
  topic,
  completed,
  onPress,
}: {
  topic: Topic;
  completed: boolean;
  onPress: () => void;
}) {
  const accent = accentFor(topic.category);
  const hardestReward = topic.questions.reduce((m, q) => Math.max(m, q.coinsReward), 0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.accentBar, { backgroundColor: accent.primary }]} />
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <View style={[styles.tag, { backgroundColor: accent.soft, borderColor: accent.primary }]}>
            <Text style={[styles.tagLabel, { color: accent.primary }]}>{accent.label}</Text>
          </View>
          {completed && (
            <View style={styles.completedTag}>
              <Text style={styles.completedDot}>●</Text>
              <Text style={styles.completedText}>played</Text>
            </View>
          )}
        </View>

        <Text style={styles.placeholderTitle}>A mystery is waiting</Text>
        <Text style={styles.placeholderSub}>
          {topic.clue.type === 'text'
            ? 'Cryptic text clue'
            : topic.clue.type === 'image'
              ? 'Visual clue'
              : 'Audio clue'}
          {'  ·  '}
          {topic.questions.length} questions
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaIcon}>{clueIcon(topic.clue.type)}</Text>
            <Text style={styles.metaLabel}>{topic.clue.type}</Text>
          </View>
          <View style={styles.metaPill}>
            <View style={styles.coin} />
            <Text style={styles.metaLabel}>up to {hardestReward}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: { width: 4 },
  inner: { flex: 1, padding: space.lg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  tag: {
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tagLabel: { ...type.labelSm, fontSize: 10 },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedDot: { color: palette.success, fontSize: 8 },
  completedText: { ...type.labelSm, color: palette.textMuted, fontSize: 10 },
  placeholderTitle: { ...type.clue, color: palette.text, fontSize: 22, lineHeight: 28 },
  placeholderSub: { ...type.body, color: palette.textMuted, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 4,
    backgroundColor: palette.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  metaIcon: { color: palette.textMuted, fontSize: 12 },
  metaLabel: { ...type.labelSm, color: palette.textMuted, fontSize: 10, textTransform: 'none' },
  coin: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.coin },
});
