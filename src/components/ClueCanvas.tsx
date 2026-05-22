import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Pressable, Image } from 'react-native';
import type { Topic } from '@/data/types';
import { palette, type, space, radius, accentFor } from '@/theme';

type Props = {
  topic: Topic;
  onReveal: () => void;
};

export function ClueCanvas({ topic, onReveal }: Props) {
  const accent = accentFor(topic.category);
  const ctaPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(ctaPulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [ctaPulse]);

  return (
    <View style={styles.root}>
      <View style={[styles.glow, { backgroundColor: accent.glow }]} pointerEvents="none" />
      <View style={styles.categoryRow}>
        <View style={[styles.dot, { backgroundColor: accent.primary }]} />
        <Text style={[styles.categoryLabel, { color: accent.primary }]}>{accent.label}</Text>
      </View>

      <View style={styles.canvas}>
        {topic.clue.type === 'text' && <TypewriterText text={topic.clue.value} />}
        {topic.clue.type === 'image' && <ImageReveal uri={topic.clue.value} />}
        {topic.clue.type === 'audio' && (
          <AudioCard transcript={topic.clue.transcript ?? ''} accent={accent.primary} />
        )}
      </View>

      <Animated.View
        style={[
          styles.ctaWrap,
          {
            opacity: ctaPulse.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] }),
            transform: [
              {
                scale: ctaPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={onReveal}
          style={({ pressed }) => [
            styles.cta,
            { borderColor: accent.primary },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.ctaText, { color: accent.primary }]}>I have a guess →</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    let i = 0;
    setShown('');
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text]);
  return <Text style={styles.cryptic}>{shown || ' '}</Text>;
}

function ImageReveal({ uri }: { uri: string }) {
  const blur = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(blur, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [blur]);

  return (
    <View style={styles.imageWrap}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      <Animated.View
        style={[
          styles.imageOverlay,
          { opacity: blur.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] }) },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

function AudioCard({ transcript, accent }: { transcript: string; accent: string }) {
  // Decorative waveform bars (animated heights). No actual audio playback in seed.
  // Animations deferred to useEffect so SSR + client first paint render the
  // same deterministic 0-height bars and hydration succeeds.
  const bars = Array.from({ length: 28 }, (_, i) => i);
  const [anims, setAnims] = useState<Animated.Value[]>([]);

  useEffect(() => {
    const created = bars.map(() => new Animated.Value(Math.random()));
    setAnims(created);
    const animations = created.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: Math.random(),
            duration: 600 + i * 30,
            useNativeDriver: false,
          }),
          Animated.timing(v, {
            toValue: Math.random(),
            duration: 600 + i * 30,
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.audioWrap}>
      <View style={styles.waveform}>
        {anims.map((v, i) => (
          <Animated.View
            key={i}
            style={[
              styles.wavBar,
              {
                backgroundColor: accent,
                height: v.interpolate({ inputRange: [0, 1], outputRange: [10, 80] }),
              },
            ]}
          />
        ))}
      </View>
      {transcript ? (
        <Text style={styles.transcript}>"{transcript}"</Text>
      ) : (
        <Text style={styles.transcript}>(audio clue)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingHorizontal: space.xl,
    paddingVertical: space.xxxl,
    justifyContent: 'space-between',
  },
  glow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    top: -200,
    left: -150,
    opacity: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  categoryLabel: { ...type.labelSm, fontSize: 11, letterSpacing: 1.8 },
  canvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptic: {
    ...type.clue,
    color: palette.text,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 38,
    fontStyle: 'italic',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.bgCard,
  },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  audioWrap: {
    width: '100%',
    alignItems: 'center',
    gap: space.xl,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 100,
  },
  wavBar: {
    width: 4,
    borderRadius: 2,
    opacity: 0.85,
  },
  transcript: {
    ...type.body,
    color: palette.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: space.lg,
  },
  ctaWrap: { alignItems: 'center', marginBottom: space.lg },
  cta: {
    paddingHorizontal: space.xxl,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  ctaText: { ...type.labelLg, fontSize: 15, letterSpacing: 0.5 },
});
