import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { palette, type, space, radius, categoryAccents } from '@/theme';
import { useAppStore } from '@/state/store';

const { width } = Dimensions.get('window');
const PAGE_WIDTH = Math.min(width, 480);

const CARDS = [
  {
    kicker: 'EVERY TOPIC IS A MYSTERY',
    title: 'It starts with a clue.',
    body: 'A blurred photo. A cryptic line. A snippet of audio. Solve the question. Earn coins. Then learn what it really was.',
    accent: categoryAccents.history.primary,
    glyph: '✎',
  },
  {
    kicker: 'GO DEEPER',
    title: 'Swipe down to dig further.',
    body: 'Each topic has three questions, easy to hard. The full story unlocks at the end. The hardest answers earn the most.',
    accent: categoryAccents.science.primary,
    glyph: '↓',
  },
  {
    kicker: 'KEEP DISCOVERING',
    title: 'Swipe right for something new.',
    body: 'You\'ll never know what\'s next. Five topics a day, a streak that punishes skipping, and collections worth completing.',
    accent: categoryAccents.space.primary,
    glyph: '→',
  },
];

export default function OnboardingScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [page, setPage] = useState(0);
  const [username, setUsername] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
    if (p !== page) setPage(p);
  };

  const next = () => {
    if (page < CARDS.length) {
      scrollRef.current?.scrollTo({ x: (page + 1) * PAGE_WIDTH, animated: true });
    }
  };

  const finish = () => {
    const name = username.trim() || 'friend';
    completeOnboarding(name);
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {CARDS.map((c, i) => (
          <CardView key={i} card={c} />
        ))}
        {/* Final card: username */}
        <View style={[styles.page, { width: PAGE_WIDTH }]}>
          <Text style={[styles.kicker, { color: palette.coin }]}>ONE LAST THING</Text>
          <Text style={styles.title}>What do we call you?</Text>
          <Text style={styles.body}>
            Just a username. No account. Stays on your device.
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="your name"
            placeholderTextColor={palette.textDim}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={24}
          />
          <Pressable
            onPress={finish}
            style={({ pressed }) => [
              styles.finishBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.finishText}>start →</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, page === i && styles.dotActive]}
          />
        ))}
      </View>

      {page < CARDS.length && (
        <Pressable onPress={next} style={styles.nextBtn} hitSlop={12}>
          <Text style={styles.nextText}>next →</Text>
        </Pressable>
      )}
    </View>
  );
}

function CardView({ card }: { card: typeof CARDS[number] }) {
  return (
    <View style={[styles.page, { width: PAGE_WIDTH }]}>
      <View style={[styles.glyphRing, { borderColor: card.accent }]}>
        <Text style={[styles.glyph, { color: card.accent }]}>{card.glyph}</Text>
      </View>
      <Text style={[styles.kicker, { color: card.accent }]}>{card.kicker}</Text>
      <Text style={styles.title}>{card.title}</Text>
      <Text style={styles.body}>{card.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg, paddingTop: 80, paddingBottom: 60 },
  page: {
    paddingHorizontal: space.xxl,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
    gap: space.lg,
  },
  glyphRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
  },
  glyph: { fontSize: 28 },
  kicker: { ...type.labelSm, fontSize: 11, letterSpacing: 2.4 },
  title: { ...type.title, color: palette.text, fontSize: 32, lineHeight: 38 },
  body: { ...type.bodyLg, color: palette.textMuted, fontSize: 17, lineHeight: 26 },
  input: {
    width: '100%',
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    fontSize: 18,
    color: palette.text,
    backgroundColor: palette.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: space.md,
  },
  finishBtn: {
    marginTop: space.md,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    backgroundColor: palette.coin,
    alignSelf: 'flex-start',
  },
  finishText: { ...type.labelLg, color: palette.bg, fontSize: 15 },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginVertical: space.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.borderStrong,
  },
  dotActive: { backgroundColor: palette.text, width: 18 },
  nextBtn: {
    alignSelf: 'flex-end',
    marginRight: space.xxl,
    padding: space.sm,
  },
  nextText: { ...type.label, color: palette.coin },
});
