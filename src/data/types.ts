export type ClueType = 'image' | 'text' | 'audio';

export type CategoryId =
  | 'history'
  | 'science'
  | 'space'
  | 'mythology'
  | 'tech'
  | 'biology'
  | 'philosophy';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  choices: string[];
  correctAnswer: string;
  difficulty: Difficulty;
  coinsReward: number;
}

export interface ClueValue {
  type: ClueType;
  // image: a remote/local URI string (we use unsplash-style remote URLs for seed)
  // text: the cryptic sentence itself
  // audio: a remote URL to an audio file
  value: string;
  transcript?: string;
}

export interface SourceRef {
  url: string;
  title: string;
}

export interface Topic {
  id: string;
  category: CategoryId;
  accentColor: string;
  title: string;
  clue: ClueValue;
  questions: Question[];
  expansionParagraphs: string[];
  youtubeVideoId: string | null;
  youtubeChannelName: string;
  tags: string[];
  setId?: string;
  status: 'draft' | 'live' | 'rejected';
  sources: SourceRef[];
  generatedAt: string;
}

export interface CategoryStat {
  seen: number;
  correct: number;
}

export interface UserProfile {
  username: string;
  avatarUrl: string;
  coins: number;
  totalCoinsEarned: number;
  correctStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD local
  topicsCompleted: string[];
  setsCompleted: string[];
  unlockedSwag: string[];
  equippedBadge: string | null;
  equippedFrame: string | null;
  equippedTitle: string | null;
  categoryStats: Record<string, CategoryStat>;
  friends: string[];
}

export type SwagType = 'badge' | 'frame' | 'title';
export type Rarity = 'common' | 'rare' | 'legendary';

export interface SwagItem {
  id: string;
  name: string;
  type: SwagType;
  cost: number;
  description: string;
  previewAsset: string; // emoji glyph or short label rendered in-component
  rarity: Rarity;
  unlockCondition?: string;
  setUnlockId?: string;
}

export interface CollectionSet {
  id: string;
  name: string;
  description: string;
  topicIds: string[];
  rewardSwagId: string;
  coverImage: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  equippedBadge: string | null;
  equippedFrame: string | null;
  equippedTitle: string | null;
  totalCoinsEarned: number;
  correctStreak: number;
}
