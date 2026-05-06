import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { palette, type, space, radius, accentFor } from '@/theme';
import { useAppStore, seedSets, seedSwag } from '@/state/store';
import { useHasMounted } from '@/lib/useHasMounted';

export default function SetDetailScreen() {
  const mounted = useHasMounted();
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: palette.bg }} />;
  }
  return <SetDetailScreenInner />;
}

function SetDetailScreenInner() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const set = useMemo(() => seedSets.find((s) => s.id === id), [id]);
  const topics = useAppStore((s) => s.topics);
  const profile = useAppStore((s) => s.profile);

  if (!set) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Set not found.</Text>
        <Pressable onPress={() => router.replace('/sets')} hitSlop={12}>
          <Text style={styles.back}>← back to collections</Text>
        </Pressable>
      </View>
    );
  }

  const setTopics = set.topicIds
    .map((id) => topics.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t);
  const completedCount = setTopics.filter((t) => profile.topicsCompleted.includes(t.id)).length;
  const reward = seedSwag.find((s) => s.id === set.rewardSwagId);
  const earned = profile.setsCompleted.includes(set.id);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← back</Text>
        </Pressable>
      </View>

      <Image source={{ uri: set.coverImage }} style={styles.cover} />
      <View style={styles.coverOverlay} pointerEvents="none" />

      <View style={styles.header}>
        <Text style={styles.kicker}>COLLECTION</Text>
        <Text style={styles.title}>{set.name}</Text>
        <Text style={styles.desc}>{set.description}</Text>
        <View style={styles.progressRow}>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${(completedCount / setTopics.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {completedCount} / {setTopics.length}
          </Text>
        </View>
      </View>

      <View style={styles.topicsList}>
        {setTopics.map((t) => {
          const accent = accentFor(t.category);
          const done = profile.topicsCompleted.includes(t.id);
          return (
            <Pressable
              key={t.id}
              onPress={() => router.push({ pathname: '/play', params: { topicId: t.id } })}
              style={({ pressed }) => [
                styles.topicRow,
                done && { borderColor: palette.success },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.topicAccent, { backgroundColor: accent.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.topicTeaser}>
                  {done ? t.title : 'a mystery'}
                </Text>
                <Text style={styles.topicMeta}>
                  {accent.label} · {t.questions.length}q
                </Text>
              </View>
              {done ? (
                <View style={styles.checkBox}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              ) : (
                <Text style={styles.unlockArrow}>→</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {reward && (
        <View
          style={[
            styles.rewardCard,
            earned && { borderColor: palette.coin, backgroundColor: 'rgba(245,199,106,0.05)' },
          ]}
        >
          <Text style={styles.rewardKicker}>
            {earned ? 'UNLOCKED' : 'LOCKED REWARD'}
          </Text>
          <View style={styles.rewardBody}>
            <Text style={styles.rewardGlyph}>{reward.previewAsset}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardSub}>
                Legendary {reward.type}. {reward.description}
              </Text>
            </View>
          </View>
          {!earned && (
            <Text style={styles.rewardHint}>
              Complete every topic in the set to claim it.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { paddingBottom: space.xxxl, gap: space.lg },
  topBar: { paddingHorizontal: space.lg, paddingTop: 56, paddingBottom: space.sm, zIndex: 5 },
  back: { ...type.label, color: palette.textMuted, textTransform: 'lowercase' },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    opacity: 0.35,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(13,13,13,0.5)',
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    gap: space.sm,
  },
  kicker: {
    ...type.labelSm,
    color: palette.coin,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  title: { ...type.title, color: palette.text, fontSize: 30 },
  desc: { ...type.body, color: palette.textMuted, fontStyle: 'italic' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: palette.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: palette.coin },
  progressLabel: { ...type.labelSm, color: palette.textMuted, fontVariant: ['tabular-nums'] },
  topicsList: { paddingHorizontal: space.lg, gap: space.sm },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.bgCard,
  },
  topicAccent: { width: 4, height: '100%', minHeight: 28, borderRadius: 2 },
  topicTeaser: { ...type.labelLg, color: palette.text },
  topicMeta: { ...type.labelSm, color: palette.textMuted, marginTop: 2 },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: palette.bg, fontWeight: '700' },
  unlockArrow: { color: palette.textMuted, fontSize: 18 },
  rewardCard: {
    marginHorizontal: space.lg,
    backgroundColor: palette.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: space.lg,
    gap: space.md,
  },
  rewardKicker: {
    ...type.labelSm,
    color: palette.textMuted,
    fontSize: 10,
    letterSpacing: 2,
  },
  rewardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  rewardGlyph: { fontSize: 32 },
  rewardName: { ...type.title, color: palette.text, fontSize: 18 },
  rewardSub: { ...type.bodySm, color: palette.textMuted, marginTop: 2 },
  rewardHint: { ...type.labelSm, color: palette.textMuted, textTransform: 'none', fontStyle: 'italic' },
  empty: {
    flex: 1,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  emptyText: { ...type.body, color: palette.textMuted },
});
