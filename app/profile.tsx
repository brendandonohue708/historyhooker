import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { palette, type, space, radius } from '@/theme';
import { useAppStore, seedSets, seedSwag } from '@/state/store';
import { Avatar } from '@/components/Avatar';
import { CoinPill } from '@/components/CoinPill';
import { CategoryBarChart } from '@/components/CategoryBarChart';
import { useHasMounted } from '@/lib/useHasMounted';

export default function ProfileScreen() {
  const mounted = useHasMounted();
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: palette.bg }} />;
  }
  return <ProfileScreenInner />;
}

function ProfileScreenInner() {
  const profile = useAppStore((s) => s.profile);
  const topics = useAppStore((s) => s.topics);

  const equippedTitle = useMemo(
    () =>
      profile.equippedTitle
        ? seedSwag.find((s) => s.id === profile.equippedTitle)?.previewAsset
        : null,
    [profile.equippedTitle],
  );
  const equippedBadge = useMemo(
    () =>
      profile.equippedBadge
        ? seedSwag.find((s) => s.id === profile.equippedBadge)
        : null,
    [profile.equippedBadge],
  );

  const favoriteCategory = useMemo(() => {
    let best: [string, number] | null = null;
    Object.entries(profile.categoryStats).forEach(([k, v]) => {
      if (!best || v.correct > best[1]) best = [k, v.correct];
    });
    return best ? best[0] : '—';
  }, [profile.categoryStats]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← back</Text>
        </Pressable>
        <CoinPill amount={profile.coins} />
      </View>

      <View style={styles.header}>
        <Avatar username={profile.username || 'Friend'} frameId={profile.equippedFrame} size={88} />
        <Text style={styles.username}>{profile.username || 'no name set'}</Text>
        {equippedTitle && <Text style={styles.title}>{equippedTitle}</Text>}
        {equippedBadge && (
          <View style={styles.badgeRow}>
            <Text style={styles.badgeGlyph}>{equippedBadge.previewAsset}</Text>
            <Text style={styles.badgeName}>{equippedBadge.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <Stat label="Topics" value={profile.topicsCompleted.length} />
        <Stat label="Streak" value={profile.correctStreak} />
        <Stat label="Best streak" value={profile.longestStreak} />
        <Stat label="Total earned" value={profile.totalCoinsEarned} muted />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite category</Text>
        <Text style={styles.faveCategory}>
          {favoriteCategory.charAt(0).toUpperCase() + favoriteCategory.slice(1)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where you've been</Text>
        <CategoryBarChart stats={profile.categoryStats} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Collection progress</Text>
        <View style={{ gap: space.md }}>
          {seedSets.map((set) => {
            const completed = set.topicIds.filter((id) =>
              profile.topicsCompleted.includes(id),
            ).length;
            const total = set.topicIds.length;
            return (
              <Pressable
                key={set.id}
                onPress={() => router.push({ pathname: '/sets/[id]', params: { id: set.id } })}
                style={({ pressed }) => [styles.setCard, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.setName}>{set.name}</Text>
                <View style={styles.setBarTrack}>
                  <View
                    style={[
                      styles.setBarFill,
                      { width: `${(completed / total) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.setCount}>
                  {completed} / {total}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends</Text>
        <View style={styles.friendsPlaceholder}>
          <Text style={styles.placeholderText}>Friends coming later</Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/shop')}
        style={({ pressed }) => [styles.shopBtn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.shopBtnText}>Visit Swag Shop →</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, muted && { color: palette.textMuted, fontSize: 18 }]}>
        {value.toLocaleString()}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: {
    paddingTop: 56,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  back: { ...type.label, color: palette.textMuted, textTransform: 'lowercase' },
  header: {
    alignItems: 'center',
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  username: { ...type.title, color: palette.text, fontSize: 26, marginTop: space.md },
  title: { ...type.body, color: palette.textMuted, fontStyle: 'italic' },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.bgElevated,
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: space.sm,
  },
  badgeGlyph: { fontSize: 14 },
  badgeName: { ...type.labelSm, color: palette.text, fontSize: 11 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: palette.bgCard,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  statValue: {
    ...type.title,
    color: palette.text,
    fontSize: 24,
    lineHeight: 30,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { ...type.labelSm, color: palette.textMuted, marginTop: 2 },
  section: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  sectionTitle: {
    ...type.label,
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  faveCategory: {
    ...type.title,
    color: palette.text,
    fontSize: 22,
  },
  setCard: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: space.lg,
    gap: space.sm,
  },
  setName: { ...type.labelLg, color: palette.text },
  setBarTrack: {
    height: 6,
    backgroundColor: palette.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  setBarFill: {
    height: '100%',
    backgroundColor: palette.coin,
  },
  setCount: { ...type.labelSm, color: palette.textMuted, fontVariant: ['tabular-nums'] },
  friendsPlaceholder: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: space.lg,
    alignItems: 'center',
  },
  placeholderText: { ...type.body, color: palette.textMuted, fontStyle: 'italic' },
  shopBtn: {
    marginHorizontal: space.lg,
    backgroundColor: palette.bgCard,
    paddingVertical: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.coin,
    alignItems: 'center',
  },
  shopBtnText: { ...type.labelLg, color: palette.coin },
});
