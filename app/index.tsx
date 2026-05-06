import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  AppState,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { palette, type, space, radius, categoryAccents } from '@/theme';
import {
  useAppStore,
  useDailyRemaining,
} from '@/state/store';
import { StreakBanner } from '@/components/StreakBanner';
import { CoinPill } from '@/components/CoinPill';
import { CategoryChip } from '@/components/CategoryChip';
import { TopicPreviewCard } from '@/components/TopicPreviewCard';
import type { CategoryId } from '@/data/types';

const CATEGORIES = Object.keys(categoryAccents) as CategoryId[];

export default function FeedScreen() {
  const topics = useAppStore((s) => s.topics);
  const profile = useAppStore((s) => s.profile);
  const dailyRemaining = useDailyRemaining();
  const newTopicsBannerCount = useAppStore((s) => s.newTopicsBannerCount);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const registerTopicView = useAppStore((s) => s.registerTopicView);
  const [filter, setFilter] = useState<CategoryId | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // First-launch gate: route to onboarding once state has rehydrated.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!onboardingComplete) router.replace('/onboarding');
  }, [hasHydrated, onboardingComplete]);

  // Day rollover when the app comes back to the foreground.
  useEffect(() => {
    if (Platform.OS === 'web') {
      // On web there is no AppState, but visibility change is the closest analogue.
      const onVisible = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          registerTopicView('feed-foreground');
        }
      };
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
      }
      return;
    }
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') registerTopicView('feed-foreground');
    });
    return () => sub.remove();
  }, [registerTopicView]);

  const filtered = useMemo(
    () =>
      filter
        ? topics.filter((t) => t.category === filter)
        : topics,
    [topics, filter],
  );

  const completedSet = useMemo(
    () => new Set(profile.topicsCompleted),
    [profile.topicsCompleted],
  );

  const onSurprise = useCallback(() => {
    const unseen = topics.filter((t) => !completedSet.has(t.id));
    const pool = unseen.length > 0 ? unseen : topics;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.push({ pathname: '/play', params: { topicId: pick.id } });
  }, [topics, completedSet]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Stub for syncTopics() — wired up in Phase F.
    await new Promise((r) => setTimeout(r, 500));
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={palette.coin}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.brand}>HistoryHooker</Text>
          <Text style={styles.greeting}>
            {profile.username ? `welcome back, ${profile.username}` : 'a quiet hello'}
          </Text>
        </View>
        <CoinPill amount={profile.coins} />
      </View>

      {newTopicsBannerCount > 0 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ✦  {newTopicsBannerCount} new topics added
          </Text>
        </View>
      )}

      <StreakBanner streak={profile.correctStreak} dailyRemaining={dailyRemaining} />

      <Pressable
        onPress={onSurprise}
        style={({ pressed }) => [styles.surprise, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.surpriseLabel}>Surprise me</Text>
        <Text style={styles.surpriseSub}>pick something I haven't seen</Text>
        <Text style={styles.surpriseArrow}>→</Text>
      </Pressable>

      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg }}
        >
          <Pressable
            onPress={() => setFilter(null)}
            style={[styles.allChip, !filter && styles.allChipSelected]}
          >
            <Text style={[styles.allChipLabel, !filter && { color: palette.text }]}>
              All
            </Text>
          </Pressable>
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              category={c}
              selected={filter === c}
              onPress={() => setFilter(filter === c ? null : c)}
              small
            />
          ))}
        </ScrollView>
      </View>

      {profile.topicsCompleted.length === topics.length && topics.length > 0 && (
        <View style={styles.allDone}>
          <Text style={styles.allDoneTitle}>You've seen everything.</Text>
          <Text style={styles.allDoneBody}>
            New topics arrive every few days. Check back, or revisit one.
          </Text>
        </View>
      )}

      <View style={styles.list}>
        {filtered.map((t) => (
          <TopicPreviewCard
            key={t.id}
            topic={t}
            completed={completedSet.has(t.id)}
            onPress={() =>
              router.push({ pathname: '/play', params: { topicId: t.id } })
            }
          />
        ))}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nothing here yet.</Text>
          </View>
        )}
      </View>

      <View style={styles.footerNav}>
        <Link href="/profile" style={styles.footerLink}>
          Profile
        </Link>
        <Link href="/sets" style={styles.footerLink}>
          Collections
        </Link>
        <Link href="/shop" style={styles.footerLink}>
          Shop
        </Link>
        <Link href="/leaderboard" style={styles.footerLink}>
          Leaderboard
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  scroll: { paddingTop: 64, paddingBottom: 80, gap: space.xl },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  brand: { ...type.title, color: palette.text, fontSize: 26, lineHeight: 32 },
  greeting: { ...type.body, color: palette.textMuted, marginTop: 4 },
  banner: {
    marginHorizontal: space.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: palette.coin,
  },
  bannerText: { ...type.label, color: palette.text, textTransform: 'none' },
  surprise: {
    marginHorizontal: space.lg,
    padding: space.lg,
    backgroundColor: palette.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  surpriseLabel: { ...type.labelLg, color: palette.text, flexShrink: 0 },
  surpriseSub: { ...type.bodySm, color: palette.textMuted, flex: 1 },
  surpriseArrow: { ...type.title, color: palette.coin, fontSize: 28, lineHeight: 32 },
  filterRow: { marginHorizontal: -space.lg },
  allChip: {
    paddingHorizontal: space.lg,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allChipSelected: { borderColor: palette.text, backgroundColor: palette.bgCard },
  allChipLabel: { ...type.label, color: palette.textMuted, fontSize: 11 },
  list: { gap: space.md, paddingHorizontal: space.lg },
  empty: {
    paddingVertical: space.xxxl,
    alignItems: 'center',
  },
  emptyText: { ...type.body, color: palette.textMuted },
  allDone: {
    marginHorizontal: space.lg,
    padding: space.xl,
    backgroundColor: palette.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.coin,
  },
  allDoneTitle: { ...type.title, color: palette.coin, fontSize: 22, lineHeight: 28 },
  allDoneBody: { ...type.body, color: palette.textMuted, marginTop: space.sm },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: space.lg,
    marginTop: space.xl,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: space.lg,
  },
  footerLink: {
    ...type.label,
    color: palette.textMuted,
    fontSize: 11,
  },
});
