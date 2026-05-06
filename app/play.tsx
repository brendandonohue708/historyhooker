import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { palette, type, space, accentFor } from '@/theme';
import { useAppStore, seedSets, seedSwag } from '@/state/store';
import { ClueCanvas } from '@/components/ClueCanvas';
import { QuestionCard } from '@/components/QuestionCard';
import { ExpansionSheet } from '@/components/ExpansionSheet';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { CoinPill } from '@/components/CoinPill';
import { useHasMounted } from '@/lib/useHasMounted';

type Stage = 'clue' | 'question' | 'expansion' | 'topicComplete';

// Soft, no-op-on-web haptic wrapper.
const haptic = (kind: 'light' | 'success' | 'error') => {
  if (Platform.OS === 'web') return;
  if (kind === 'light') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  if (kind === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  if (kind === 'error') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export default function PlayScreen() {
  const mounted = useHasMounted();
  if (!mounted) {
    // Empty shell during SSR and the synchronous first client paint.
    // Both produce the same DOM, so React's hydration succeeds and
    // useEffects start firing in PlayScreenInner below.
    return <View style={{ flex: 1, backgroundColor: palette.bg }} />;
  }
  return <PlayScreenInner />;
}

function PlayScreenInner() {
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();
  const topics = useAppStore((s) => s.topics);
  const profile = useAppStore((s) => s.profile);
  const recordCorrect = useAppStore((s) => s.recordCorrect);
  const recordWrong = useAppStore((s) => s.recordWrong);
  const completeTopic = useAppStore((s) => s.completeTopic);
  const registerTopicView = useAppStore((s) => s.registerTopicView);

  const topic = useMemo(() => {
    return topics.find((t) => t.id === topicId) ?? topics[0];
  }, [topics, topicId]);

  const [stage, setStage] = useState<Stage>('clue');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [setCelebration, setSetCelebration] = useState<string | null>(null);
  const dragX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setStage('clue');
    setQuestionIndex(0);
    registerTopicView(topic.id);
  }, [topic.id, registerTopicView]);

  const accent = accentFor(topic.category);
  const currentQ = topic.questions[questionIndex];

  const onClueDone = useCallback(() => {
    haptic('light');
    setStage('question');
  }, []);

  const onAnswered = useCallback(
    (correct: boolean) => {
      if (correct) {
        haptic('success');
        recordCorrect(topic.id, currentQ.difficulty, currentQ.coinsReward);
        setConfetti((c) => c + 1);
      } else {
        haptic('error');
        recordWrong(topic.id, currentQ.difficulty);
      }
      setTimeout(() => setStage('expansion'), 200);
    },
    [topic.id, currentQ, recordCorrect, recordWrong],
  );

  const goNextQuestion = useCallback(() => {
    if (questionIndex + 1 < topic.questions.length) {
      setQuestionIndex((i) => i + 1);
      setStage('question');
    } else {
      const result = completeTopic(topic.id);
      if (result.setCompleted) {
        const set = seedSets.find((cs) => cs.id === result.setCompleted);
        setSetCelebration(set?.name ?? 'Collection');
      }
      setStage('topicComplete');
    }
  }, [questionIndex, topic, completeTopic]);

  const goNextTopic = useCallback(() => {
    const completed = new Set(profile.topicsCompleted);
    const unseen = topics.filter((t) => !completed.has(t.id) && t.id !== topic.id);
    const pool = unseen.length > 0 ? unseen : topics.filter((t) => t.id !== topic.id);
    if (pool.length === 0) {
      router.replace('/');
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.replace({ pathname: '/play', params: { topicId: pick.id } });
  }, [profile.topicsCompleted, topics, topic.id]);

  const backToFeed = useCallback(() => router.replace('/'), []);

  // Swipes (work on web touch + mouse drag, and on native touch via PanResponder).
  // Active only after the user has reached the expansion stage so the question
  // taps aren't intercepted.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_evt, g) =>
          stage === 'expansion' &&
          (Math.abs(g.dx) > 18 || Math.abs(g.dy) > 18),
        onPanResponderMove: (_evt, g) => {
          if (Math.abs(g.dx) > Math.abs(g.dy)) {
            dragX.setValue(g.dx);
          }
        },
        onPanResponderRelease: (_evt, g) => {
          dragX.setValue(0);
          const horizontal = Math.abs(g.dx) > Math.abs(g.dy);
          if (horizontal) {
            if (g.dx < -90) {
              backToFeed();
            } else if (g.dx > 90) {
              goNextTopic();
            }
          } else {
            if (g.dy < -90) {
              // swipe up: also acts as next question shortcut
              goNextQuestion();
            } else if (g.dy > 90) {
              goNextQuestion();
            }
          }
        },
        onPanResponderTerminate: () => dragX.setValue(0),
      }),
    [stage, dragX, backToFeed, goNextQuestion, goNextTopic],
  );

  return (
    <Animated.View
      style={[styles.root, { transform: [{ translateX: dragX }] }]}
      {...panResponder.panHandlers}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={backToFeed} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← feed</Text>
        </Pressable>
        <View style={styles.topMeta}>
          <Text style={styles.questionCount}>
            Q{questionIndex + 1} / {topic.questions.length}
          </Text>
          <CoinPill amount={profile.coins} />
        </View>
      </View>

      {/* Main canvas — clue or remains visible behind question */}
      <View style={styles.canvas}>
        {stage === 'clue' && <ClueCanvas topic={topic} onReveal={onClueDone} />}
        {(stage === 'question' || stage === 'expansion' || stage === 'topicComplete') && (
          <View style={styles.cluePeek}>
            <View
              style={[
                styles.peekGlow,
                { backgroundColor: accent.glow },
              ]}
              pointerEvents="none"
            />
            <View style={styles.peekRow}>
              <View style={[styles.peekDot, { backgroundColor: accent.primary }]} />
              <Text style={[styles.peekLabel, { color: accent.primary }]}>
                {accent.label}
              </Text>
            </View>
            <Text style={styles.peekClue} numberOfLines={3}>
              {topic.clue.type === 'text' ? topic.clue.value : `(${topic.clue.type} clue)`}
            </Text>
          </View>
        )}
      </View>

      {/* Stage 2: Question card */}
      {stage === 'question' && (
        <View style={styles.questionWrap}>
          <QuestionCard
            category={topic.category}
            question={currentQ}
            onAnswered={onAnswered}
          />
        </View>
      )}

      {/* Stage 3: Expansion sheet */}
      {(stage === 'expansion' || stage === 'topicComplete') && (
        <ExpansionSheet
          topic={topic}
          visible={stage === 'expansion' || stage === 'topicComplete'}
        />
      )}

      {/* Topic-complete celebration overlay */}
      {stage === 'topicComplete' && (
        <View style={styles.celebrate} pointerEvents="box-none">
          <View style={styles.celebrateInner}>
            {setCelebration && (
              <View style={[styles.setBanner, { borderColor: palette.coin }]}>
                <Text style={styles.setBannerKicker}>SET COMPLETE</Text>
                <Text style={styles.setBannerTitle}>{setCelebration}</Text>
                <Text style={styles.setBannerSub}>+ legendary swag unlocked</Text>
              </View>
            )}
            <Text style={[styles.celebrateKicker, { color: accent.primary }]}>
              TOPIC COMPLETE
            </Text>
            <Text style={styles.celebrateTitle}>{topic.title}</Text>
            <View style={styles.celebrateRow}>
              <Pressable
                onPress={goNextTopic}
                style={({ pressed }) => [
                  styles.celebrateBtn,
                  { borderColor: accent.primary },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={[styles.celebrateBtnText, { color: accent.primary }]}>
                  explore more →
                </Text>
              </Pressable>
              <Pressable
                onPress={backToFeed}
                style={({ pressed }) => [
                  styles.celebrateBtnAlt,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.celebrateBtnAltText}>back to feed</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Confetti above everything but ignoring touches */}
      <ConfettiBurst trigger={confetti} />

      {/* Persistent swipe hint when on expansion stage */}
      {stage === 'expansion' && (
        <View style={styles.gestureHint} pointerEvents="none">
          <Text style={styles.gestureHintText}>
            swipe ↓ next q   ·   → new topic   ·   ← back
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    zIndex: 10,
  },
  backBtn: { padding: space.sm },
  backText: { ...type.label, color: palette.textMuted, textTransform: 'lowercase' },
  topMeta: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  questionCount: { ...type.labelSm, color: palette.textMuted, fontSize: 11 },
  canvas: {
    flex: 1,
  },
  cluePeek: {
    flex: 1,
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
    paddingBottom: space.xxxl,
    justifyContent: 'flex-start',
  },
  peekGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    top: -200,
    left: -100,
    opacity: 0.3,
  },
  peekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
  },
  peekDot: { width: 6, height: 6, borderRadius: 3 },
  peekLabel: { ...type.labelSm, fontSize: 11, letterSpacing: 1.8 },
  peekClue: {
    ...type.bodyLg,
    color: palette.textMuted,
    fontStyle: 'italic',
  },
  questionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  celebrate: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,13,13,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  celebrateInner: {
    paddingHorizontal: space.xl,
    alignItems: 'center',
    width: '100%',
    gap: space.md,
  },
  celebrateKicker: { ...type.labelSm, fontSize: 11, letterSpacing: 2.4 },
  celebrateTitle: {
    ...type.title,
    color: palette.text,
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: space.xl,
  },
  celebrateRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.md,
  },
  celebrateBtn: {
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: 999,
    borderWidth: 1,
  },
  celebrateBtnText: { ...type.label },
  celebrateBtnAlt: {
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
  },
  celebrateBtnAltText: { ...type.label, color: palette.textMuted },
  setBanner: {
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(245,199,106,0.05)',
    alignItems: 'center',
    marginBottom: space.xl,
  },
  setBannerKicker: { ...type.labelSm, color: palette.coin, fontSize: 10, letterSpacing: 2 },
  setBannerTitle: { ...type.title, color: palette.coin, fontSize: 20, marginTop: 4 },
  setBannerSub: { ...type.bodySm, color: palette.textMuted, marginTop: 4 },
  gestureHint: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  gestureHintText: {
    ...type.labelSm,
    color: palette.textDim,
    fontSize: 10,
    letterSpacing: 1.2,
  },
});
