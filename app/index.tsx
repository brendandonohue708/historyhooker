import { View, Text, StyleSheet } from 'react-native';
import { palette, type } from '@/theme';

export default function FeedScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.brand}>HistoryHooker</Text>
      <Text style={styles.tagline}>The mystery starts here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brand: { ...type.title, color: palette.text },
  tagline: { ...type.body, color: palette.textMuted, marginTop: 8 },
});
