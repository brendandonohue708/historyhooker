import { View, Text, StyleSheet } from 'react-native';
import { palette, type } from '@/theme';

export default function LeaderboardScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.body}>Weekly + all-time.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { ...type.title, color: palette.text },
  body: { ...type.body, color: palette.textMuted, marginTop: 8 },
});
