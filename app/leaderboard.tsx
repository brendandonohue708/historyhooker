import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { palette, type, space, radius } from '@/theme';
import { useAppStore, seedLeaderboard, seedSwag } from '@/state/store';
import type { LeaderboardEntry } from '@/data/types';
import { useHasMounted } from '@/lib/useHasMounted';

type Tab = 'weekly' | 'all';

export default function LeaderboardScreen() {
  const mounted = useHasMounted();
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: palette.bg }} />;
  }
  return <LeaderboardScreenInner />;
}

function LeaderboardScreenInner() {
  const profile = useAppStore((s) => s.profile);
  const [tab, setTab] = useState<Tab>('weekly');

  // Build the entry for the current user from local state and inject it.
  const currentEntry: LeaderboardEntry = useMemo(
    () => ({
      userId: 'self',
      username: profile.username || 'you',
      equippedBadge: profile.equippedBadge,
      equippedFrame: profile.equippedFrame,
      equippedTitle: profile.equippedTitle,
      // Weekly view shows current coins as a stand-in for weekly earned;
      // all-time uses totalCoinsEarned.
      totalCoinsEarned:
        tab === 'weekly' ? profile.coins : profile.totalCoinsEarned,
      correctStreak: profile.correctStreak,
    }),
    [profile, tab],
  );

  const ranked = useMemo(() => {
    const others = seedLeaderboard.map((e) =>
      tab === 'weekly'
        ? { ...e, totalCoinsEarned: Math.round(e.totalCoinsEarned * 0.18) }
        : e,
    );
    return [...others, currentEntry].sort(
      (a, b) => b.totalCoinsEarned - a.totalCoinsEarned,
    );
  }, [currentEntry, tab]);

  const myRank = ranked.findIndex((e) => e.userId === 'self') + 1;

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← back</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Leaderboard</Text>
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('weekly')}
          style={[styles.tab, tab === 'weekly' && styles.tabActive]}
        >
          <Text style={[styles.tabLabel, tab === 'weekly' && styles.tabLabelActive]}>
            this week
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('all')}
          style={[styles.tab, tab === 'all' && styles.tabActive]}
        >
          <Text style={[styles.tabLabel, tab === 'all' && styles.tabLabelActive]}>
            all time
          </Text>
        </Pressable>
      </View>

      <View style={styles.youPill}>
        <Text style={styles.youLabel}>YOU</Text>
        <Text style={styles.youRank}>#{myRank}</Text>
        <Text style={styles.yourScore}>
          {currentEntry.totalCoinsEarned.toLocaleString()} coins
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: space.xxxl, gap: 6, paddingHorizontal: space.lg }}
        showsVerticalScrollIndicator={false}
      >
        {ranked.map((e, i) => {
          const isMe = e.userId === 'self';
          const titleText = e.equippedTitle
            ? seedSwag.find((s) => s.id === e.equippedTitle)?.previewAsset
            : null;
          const badgeGlyph = e.equippedBadge
            ? seedSwag.find((s) => s.id === e.equippedBadge)?.previewAsset
            : null;
          return (
            <View
              key={e.userId}
              style={[
                styles.row,
                isMe && {
                  borderColor: palette.coin,
                  backgroundColor: 'rgba(245,199,106,0.06)',
                },
              ]}
            >
              <Text style={[styles.rank, i < 3 && { color: palette.coin }]}>
                #{i + 1}
              </Text>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  {badgeGlyph && <Text style={styles.glyph}>{badgeGlyph}</Text>}
                  <Text style={[styles.name, isMe && { color: palette.coin }]}>
                    {e.username}
                  </Text>
                </View>
                {titleText && <Text style={styles.userTitle}>{titleText}</Text>}
              </View>
              <View style={styles.statsCol}>
                <Text style={styles.score}>{e.totalCoinsEarned.toLocaleString()}</Text>
                <Text style={styles.streak}>{e.correctStreak}d streak</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg, paddingTop: 56 },
  topBar: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  back: { ...type.label, color: palette.textMuted, textTransform: 'lowercase' },
  title: {
    ...type.title,
    color: palette.text,
    fontSize: 28,
    paddingHorizontal: space.lg,
  },
  tabs: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.bgElevated,
  },
  tabActive: { borderColor: palette.text, backgroundColor: palette.bgCard },
  tabLabel: { ...type.label, color: palette.textMuted },
  tabLabelActive: { color: palette.text },
  youPill: {
    marginHorizontal: space.lg,
    marginBottom: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: palette.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.coin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  youLabel: {
    ...type.labelSm,
    fontSize: 9,
    color: palette.coin,
    letterSpacing: 2,
  },
  youRank: { ...type.title, color: palette.coin, fontSize: 22 },
  yourScore: { ...type.body, color: palette.textMuted, marginLeft: 'auto' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    backgroundColor: palette.bgCard,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  rank: {
    ...type.digits,
    fontSize: 16,
    color: palette.textMuted,
    width: 36,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  glyph: { fontSize: 14 },
  name: { ...type.labelLg, color: palette.text, textTransform: 'lowercase' },
  userTitle: { ...type.bodySm, color: palette.textMuted, fontStyle: 'italic', marginTop: 2 },
  statsCol: { alignItems: 'flex-end' },
  score: { ...type.label, color: palette.text, fontVariant: ['tabular-nums'], fontSize: 14 },
  streak: { ...type.labelSm, color: palette.textMuted, fontSize: 10 },
});
