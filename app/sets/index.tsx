import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { palette, type, space, radius } from '@/theme';
import { useAppStore, seedSets, seedSwag } from '@/state/store';
import { useHasMounted } from '@/lib/useHasMounted';

export default function SetsScreen() {
  const mounted = useHasMounted();
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: palette.bg }} />;
  }
  return <SetsScreenInner />;
}

function SetsScreenInner() {
  const profile = useAppStore((s) => s.profile);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← back</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Collections</Text>
      <Text style={styles.kicker}>finish a collection to unlock legendary swag.</Text>

      <View style={styles.grid}>
        {seedSets.map((set) => {
          const completed = set.topicIds.filter((id) =>
            profile.topicsCompleted.includes(id),
          ).length;
          const total = set.topicIds.length;
          const reward = seedSwag.find((s) => s.id === set.rewardSwagId);
          const earned = profile.setsCompleted.includes(set.id);
          return (
            <Pressable
              key={set.id}
              onPress={() => router.push({ pathname: '/sets/[id]', params: { id: set.id } })}
              style={({ pressed }) => [
                styles.card,
                earned && { borderColor: palette.coin },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Image source={{ uri: set.coverImage }} style={styles.cover} />
              <View style={styles.coverOverlay} pointerEvents="none" />
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.setName}>{set.name}</Text>
                  {earned && <Text style={styles.completedTag}>COMPLETE</Text>}
                </View>
                <Text style={styles.setDesc}>{set.description}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${(completed / total) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.count}>
                    {completed} / {total}
                  </Text>
                </View>
                {reward && (
                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardGlyph}>{reward.previewAsset}</Text>
                    <Text style={styles.rewardLabel}>
                      reward: {reward.name} ({reward.type})
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { paddingTop: 56, paddingBottom: space.xxxl, gap: space.lg },
  topBar: { paddingHorizontal: space.lg },
  back: { ...type.label, color: palette.textMuted, textTransform: 'lowercase' },
  title: {
    ...type.title,
    color: palette.text,
    fontSize: 28,
    paddingHorizontal: space.lg,
  },
  kicker: {
    ...type.body,
    color: palette.textMuted,
    paddingHorizontal: space.lg,
    fontStyle: 'italic',
  },
  grid: {
    paddingHorizontal: space.lg,
    gap: space.lg,
  },
  card: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: 140,
    opacity: 0.4,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 140,
    backgroundColor: 'rgba(13,13,13,0.45)',
  },
  cardBody: {
    padding: space.lg,
    gap: space.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setName: { ...type.title, color: palette.text, fontSize: 22, lineHeight: 26 },
  completedTag: { ...type.labelSm, fontSize: 9, color: palette.coin, letterSpacing: 1.8 },
  setDesc: { ...type.body, color: palette.textMuted, fontStyle: 'italic' },
  cardFooter: {
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
  count: { ...type.labelSm, color: palette.textMuted, fontVariant: ['tabular-nums'] },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
  },
  rewardGlyph: { fontSize: 14 },
  rewardLabel: { ...type.labelSm, color: palette.textMuted, textTransform: 'none' },
});
