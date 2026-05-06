import { View, Text, StyleSheet } from 'react-native';
import { palette, type } from '@/theme';

export default function OnboardingScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.body}>Coming next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { ...type.title, color: palette.text },
  body: { ...type.body, color: palette.textMuted, marginTop: 8 },
});
