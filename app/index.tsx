import { View, Text, StyleSheet } from 'react-native';
import { palette } from '@/theme';

export default function FeedScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.brand}>HistoryHooker</Text>
      <Text style={styles.tagline}>The mystery starts here.</Text>
      <Text style={styles.note}>Phase A · Foundation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: '100%',
    width: '100%',
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.text,
    fontFamily: 'serif',
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 16,
    color: palette.textMuted,
    marginTop: 12,
  },
  note: {
    fontSize: 11,
    color: palette.textDim,
    marginTop: 32,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
