import { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Topic } from '@/data/types';
import { palette, type, space, radius, accentFor } from '@/theme';

type Props = {
  topic: Topic;
  visible: boolean;
};

export function ExpansionSheet({ topic, visible }: Props) {
  const accent = accentFor(topic.category);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: visible ? 1 : 0,
      friction: 9,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);

  const onYouTube = async () => {
    if (topic.youtubeVideoId) {
      const url = `https://www.youtube.com/watch?v=${topic.youtubeVideoId}`;
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch {
        await Linking.openURL(url);
      }
    } else {
      const query = encodeURIComponent(
        `${topic.title} ${topic.youtubeChannelName ?? ''}`.trim(),
      );
      const url = `https://www.youtube.com/results?search_query=${query}`;
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch {
        await Linking.openURL(url);
      }
    }
  };

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          transform: [
            {
              translateY: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [800, 0],
              }),
            },
          ],
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.handle} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: accent.soft, borderColor: accent.primary }]}>
            <Text style={[styles.tagText, { color: accent.primary }]}>
              {accent.label}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{topic.title}</Text>

        <View style={styles.divider} />

        {topic.expansionParagraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}

        <View style={styles.divider} />

        <View style={styles.youtubeCard}>
          <View style={styles.youtubeIcon}>
            <Text style={styles.youtubePlay}>▶</Text>
          </View>
          <View style={styles.youtubeText}>
            <Text style={styles.youtubeTitle}>Go deeper</Text>
            <Text style={styles.youtubeChannel}>
              search YouTube · {topic.youtubeChannelName}
            </Text>
          </View>
          <Pressable
            onPress={onYouTube}
            style={({ pressed }) => [
              styles.youtubeBtn,
              { borderColor: accent.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.youtubeBtnText, { color: accent.primary }]}>Watch</Text>
          </Pressable>
        </View>

        <View style={styles.sourcesBlock}>
          <Text style={styles.sourcesLabel}>Sources</Text>
          {topic.sources.map((s) => (
            <Pressable
              key={s.url}
              onPress={async () => {
                try {
                  await WebBrowser.openBrowserAsync(s.url);
                } catch {
                  await Linking.openURL(s.url);
                }
              }}
              style={({ pressed }) => [
                styles.sourceRow,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.sourceTitle}>{s.title}</Text>
              <Text style={styles.sourceArrow}>↗</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>
            ↓ swipe down for next question     → swipe right for new topic
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '78%',
    backgroundColor: palette.bgPanel,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: palette.border,
    paddingTop: space.md,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px -10px 40px rgba(0,0,0,0.6)' as any }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.6,
          shadowRadius: 40,
        }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: palette.borderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: space.md,
  },
  scroll: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
  },
  tagRow: { flexDirection: 'row', marginBottom: space.md },
  tag: {
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tagText: { ...type.labelSm, fontSize: 10 },
  title: {
    ...type.title,
    color: palette.text,
    fontSize: 30,
    lineHeight: 36,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: space.xl,
  },
  paragraph: {
    ...type.bodyLg,
    color: palette.text,
    marginBottom: space.lg,
  },
  youtubeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: palette.bgCard,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  youtubeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubePlay: { color: palette.white, fontSize: 16, marginLeft: 2 },
  youtubeText: { flex: 1 },
  youtubeTitle: { ...type.labelLg, color: palette.text },
  youtubeChannel: { ...type.bodySm, color: palette.textMuted, marginTop: 2 },
  youtubeBtn: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  youtubeBtnText: { ...type.label, fontSize: 12 },
  sourcesBlock: { marginTop: space.xl },
  sourcesLabel: {
    ...type.labelSm,
    color: palette.textMuted,
    marginBottom: space.sm,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  sourceTitle: {
    ...type.body,
    color: palette.text,
    flex: 1,
    paddingRight: space.md,
  },
  sourceArrow: { color: palette.textMuted, fontSize: 14 },
  swipeHint: {
    marginTop: space.xxl,
    alignItems: 'center',
  },
  swipeHintText: {
    ...type.labelSm,
    color: palette.textDim,
    textAlign: 'center',
  },
});
