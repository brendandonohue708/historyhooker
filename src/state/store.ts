import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CategoryStat,
  Difficulty,
  Topic,
  UserProfile,
} from '@/data/types';
import { seedTopics, seedSets, seedSwag, seedLeaderboard } from '@/data/seed';
import { daysBetween, todayLocal } from '@/lib/date';

const DAILY_TOPIC_LIMIT = 5;
const TOPIC_COMPLETE_BONUS = 25;
const SET_COMPLETE_BONUS = 100;
const STREAK_MILESTONES: Record<number, string> = {
  7: 'badge-streak-7',
  30: 'badge-streak-30',
  100: 'badge-streak-100',
};

const emptyProfile = (username = ''): UserProfile => ({
  username,
  avatarUrl: '',
  coins: 0,
  totalCoinsEarned: 0,
  correctStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  topicsCompleted: [],
  setsCompleted: [],
  unlockedSwag: [],
  equippedBadge: null,
  equippedFrame: null,
  equippedTitle: null,
  categoryStats: {},
  friends: [],
});

export interface AppState {
  // Hydration
  hasHydrated: boolean;

  // First-launch / onboarding
  onboardingComplete: boolean;

  // Profile (the only "user" we have until accounts exist)
  profile: UserProfile;

  // Topic catalogue, plus daily-progression metadata
  topics: Topic[];
  dailyTopicsPlayedDate: string;
  dailyTopicsPlayedCount: number;
  newTopicsBannerCount: number;
  lastSyncedAt: string | null;

  // Setters
  setHasHydrated: (v: boolean) => void;
  completeOnboarding: (username: string) => void;
  updateUsername: (username: string) => void;

  // Topic actions
  recordCorrect: (topicId: string, difficulty: Difficulty, coins: number) => void;
  recordWrong: (topicId: string, difficulty: Difficulty) => void;
  completeTopic: (topicId: string) => { topicCompleted: boolean; setCompleted: string | null };
  registerTopicView: (topicId: string) => void;

  // Inventory
  unlockSwag: (id: string) => boolean; // returns true if newly unlocked
  purchaseSwag: (id: string, cost: number) => boolean; // returns true if successful
  equipSwag: (id: string, type: 'badge' | 'frame' | 'title') => void;

  // Reset (debug)
  resetAll: () => void;
}

const initialState = {
  hasHydrated: false,
  onboardingComplete: false,
  profile: emptyProfile(),
  topics: seedTopics,
  dailyTopicsPlayedDate: '',
  dailyTopicsPlayedCount: 0,
  newTopicsBannerCount: 0,
  lastSyncedAt: null,
};

const ensureCategoryStat = (
  stats: Record<string, CategoryStat>,
  category: string,
): CategoryStat => stats[category] ?? { seen: 0, correct: 0 };

// Roll over the daily counter when the local day changes.
function rolloverDaily(state: AppState): Partial<AppState> {
  const today = todayLocal();
  if (state.dailyTopicsPlayedDate !== today) {
    return { dailyTopicsPlayedDate: today, dailyTopicsPlayedCount: 0 };
  }
  return {};
}

// Update streak based on first-correct-of-the-day rule.
function bumpStreak(profile: UserProfile): Partial<UserProfile> {
  const today = todayLocal();
  if (profile.lastActiveDate === today) return {};
  const gap = profile.lastActiveDate
    ? daysBetween(profile.lastActiveDate, today)
    : 1;
  const nextStreak = gap === 1 ? profile.correctStreak + 1 : 1;
  return {
    correctStreak: nextStreak,
    longestStreak: Math.max(profile.longestStreak, nextStreak),
    lastActiveDate: today,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      completeOnboarding: (username) =>
        set({
          onboardingComplete: true,
          profile: { ...emptyProfile(username) },
          dailyTopicsPlayedDate: todayLocal(),
        }),

      updateUsername: (username) =>
        set((s) => ({ profile: { ...s.profile, username } })),

      recordCorrect: (topicId, difficulty, coins) =>
        set((s) => {
          const rolled = rolloverDaily(s);
          const profile = s.profile;
          const topic = s.topics.find((t) => t.id === topicId);
          const cat = topic?.category ?? 'history';
          const stat = ensureCategoryStat(profile.categoryStats, cat);
          const streakUpdate = bumpStreak(profile);

          // Streak milestone unlocks
          const additionalUnlocks: string[] = [];
          const newStreak =
            (streakUpdate.correctStreak ?? profile.correctStreak) | 0;
          const milestoneId = STREAK_MILESTONES[newStreak];
          if (milestoneId && !profile.unlockedSwag.includes(milestoneId)) {
            additionalUnlocks.push(milestoneId);
          }

          return {
            ...rolled,
            profile: {
              ...profile,
              ...streakUpdate,
              coins: profile.coins + coins,
              totalCoinsEarned: profile.totalCoinsEarned + coins,
              categoryStats: {
                ...profile.categoryStats,
                [cat]: { seen: stat.seen + 1, correct: stat.correct + 1 },
              },
              unlockedSwag: [...profile.unlockedSwag, ...additionalUnlocks],
            },
          };
        }),

      recordWrong: (topicId, _difficulty) =>
        set((s) => {
          const rolled = rolloverDaily(s);
          const profile = s.profile;
          const topic = s.topics.find((t) => t.id === topicId);
          const cat = topic?.category ?? 'history';
          const stat = ensureCategoryStat(profile.categoryStats, cat);
          return {
            ...rolled,
            profile: {
              ...profile,
              correctStreak: 0,
              categoryStats: {
                ...profile.categoryStats,
                [cat]: { ...stat, seen: stat.seen + 1 },
              },
            },
          };
        }),

      registerTopicView: (_topicId) =>
        set((s) => {
          const rolled = rolloverDaily(s);
          if (Object.keys(rolled).length === 0) return {} as Partial<AppState>;
          return rolled;
        }),

      completeTopic: (topicId) => {
        const s = get();
        if (s.profile.topicsCompleted.includes(topicId)) {
          return { topicCompleted: false, setCompleted: null };
        }
        const completedTopics = [...s.profile.topicsCompleted, topicId];

        // Did completing this topic finish a collection set?
        let setCompletedId: string | null = null;
        for (const cs of seedSets) {
          if (s.profile.setsCompleted.includes(cs.id)) continue;
          if (!cs.topicIds.includes(topicId)) continue;
          if (cs.topicIds.every((id) => completedTopics.includes(id))) {
            setCompletedId = cs.id;
            break;
          }
        }

        const setReward = setCompletedId
          ? seedSets.find((cs) => cs.id === setCompletedId)?.rewardSwagId
          : null;

        const dailyCount = s.dailyTopicsPlayedDate === todayLocal()
          ? s.dailyTopicsPlayedCount + 1
          : 1;

        set({
          dailyTopicsPlayedDate: todayLocal(),
          dailyTopicsPlayedCount: dailyCount,
          profile: {
            ...s.profile,
            topicsCompleted: completedTopics,
            coins:
              s.profile.coins + TOPIC_COMPLETE_BONUS + (setCompletedId ? SET_COMPLETE_BONUS : 0),
            totalCoinsEarned:
              s.profile.totalCoinsEarned + TOPIC_COMPLETE_BONUS + (setCompletedId ? SET_COMPLETE_BONUS : 0),
            setsCompleted: setCompletedId
              ? [...s.profile.setsCompleted, setCompletedId]
              : s.profile.setsCompleted,
            unlockedSwag: setReward && !s.profile.unlockedSwag.includes(setReward)
              ? [...s.profile.unlockedSwag, setReward]
              : s.profile.unlockedSwag,
          },
        });

        return {
          topicCompleted: true,
          setCompleted: setCompletedId,
        };
      },

      unlockSwag: (id) => {
        const s = get();
        if (s.profile.unlockedSwag.includes(id)) return false;
        set({
          profile: {
            ...s.profile,
            unlockedSwag: [...s.profile.unlockedSwag, id],
          },
        });
        return true;
      },

      purchaseSwag: (id, cost) => {
        const s = get();
        if (s.profile.unlockedSwag.includes(id)) return false;
        if (s.profile.coins < cost) return false;
        set({
          profile: {
            ...s.profile,
            coins: s.profile.coins - cost,
            unlockedSwag: [...s.profile.unlockedSwag, id],
          },
        });
        return true;
      },

      equipSwag: (id, type) =>
        set((s) => {
          if (!s.profile.unlockedSwag.includes(id)) return {} as Partial<AppState>;
          const next = { ...s.profile };
          if (type === 'badge') next.equippedBadge = id;
          if (type === 'frame') next.equippedFrame = id;
          if (type === 'title') next.equippedTitle = id;
          return { profile: next };
        }),

      resetAll: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: 'historyhooker-state-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        onboardingComplete: s.onboardingComplete,
        profile: s.profile,
        dailyTopicsPlayedDate: s.dailyTopicsPlayedDate,
        dailyTopicsPlayedCount: s.dailyTopicsPlayedCount,
        newTopicsBannerCount: s.newTopicsBannerCount,
        lastSyncedAt: s.lastSyncedAt,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      version: 1,
    },
  ),
);

// Convenience selectors
export const useProfile = () => useAppStore((s) => s.profile);
export const useTopics = () => useAppStore((s) => s.topics);
export const useTopicById = (id: string) =>
  useAppStore((s) => s.topics.find((t) => t.id === id));
export const useDailyRemaining = () =>
  useAppStore((s) => {
    const today = todayLocal();
    if (s.dailyTopicsPlayedDate !== today) return DAILY_TOPIC_LIMIT;
    return Math.max(0, DAILY_TOPIC_LIMIT - s.dailyTopicsPlayedCount);
  });

// Re-export for use in screens.
export { seedSets, seedSwag, seedLeaderboard };
export const DAILY_LIMIT = DAILY_TOPIC_LIMIT;
