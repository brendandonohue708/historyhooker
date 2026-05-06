import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { palette, type } from '@/theme';

export default function SetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Collection</Text>
      <Text style={styles.body}>Set: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { ...type.title, color: palette.text },
  body: { ...type.body, color: palette.textMuted, marginTop: 8 },
});
