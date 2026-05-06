import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Pressable } from 'react-native';
import type { Question } from '@/data/types';
import { palette, type, space, radius, accentFor } from '@/theme';

type Props = {
  category: string;
  question: Question;
  onAnswered: (correct: boolean) => void;
};

export function QuestionCard({ category, question, onAnswered }: Props) {
  const accent = accentFor(category);
  const [picked, setPicked] = useState<string | null>(null);
  const slide = useRef(new Animated.Value(40)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 380, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [slide, fade]);

  const onPick = (choice: string) => {
    if (picked) return;
    setPicked(choice);
    const correct = choice === question.correctAnswer;
    if (!correct) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
    setTimeout(() => onAnswered(correct), 1500);
  };

  return (
    <Animated.View
      style={[
        styles.root,
        {
          transform: [
            { translateY: slide },
            {
              translateX: shake.interpolate({
                inputRange: [-1, 1],
                outputRange: [-8, 8],
              }),
            },
          ],
          opacity: fade,
        },
      ]}
    >
      <View style={styles.diffRow}>
        <View style={[styles.diffPill, { borderColor: accent.primary }]}>
          <Text style={[styles.diffLabel, { color: accent.primary }]}>
            {question.difficulty}
          </Text>
        </View>
        <Text style={styles.reward}>+{question.coinsReward}</Text>
      </View>
      <Text style={styles.q}>{question.text}</Text>

      <View style={styles.choices}>
        {question.choices.map((c) => {
          const isPicked = picked === c;
          const isCorrect = c === question.correctAnswer;
          const showCorrect = picked && isCorrect;
          const showWrong = picked && isPicked && !isCorrect;
          return (
            <Pressable
              key={c}
              onPress={() => onPick(c)}
              disabled={!!picked}
              style={({ pressed }) => [
                styles.choice,
                showCorrect && styles.choiceCorrect,
                showWrong && styles.choiceWrong,
                pressed && !picked && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  showCorrect && { color: palette.success },
                  showWrong && { color: palette.danger },
                ]}
              >
                {c}
              </Text>
              {showCorrect && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: palette.bgPanel,
    padding: space.xl,
    paddingBottom: space.xxl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: palette.border,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  diffPill: {
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  diffLabel: {
    ...type.labelSm,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  reward: {
    ...type.digits,
    color: palette.coin,
    fontSize: 18,
  },
  q: {
    ...type.title,
    color: palette.text,
    fontSize: 22,
    lineHeight: 30,
    marginBottom: space.xl,
  },
  choices: { gap: space.md },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  choiceCorrect: {
    backgroundColor: palette.successDim,
    borderColor: palette.success,
  },
  choiceWrong: {
    backgroundColor: palette.dangerDim,
    borderColor: palette.danger,
  },
  choiceText: { ...type.bodyLg, color: palette.text, flex: 1 },
  checkmark: {
    color: palette.success,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: space.md,
  },
});
