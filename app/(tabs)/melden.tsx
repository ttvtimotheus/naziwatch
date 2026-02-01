import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MeldenTabScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Vorfall melden</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Starte hier den anonymen Meldeablauf. Keine Anmeldung nötig.
      </Text>
      <Pressable
        style={[styles.primaryButton, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/report/')}
      >
        <Text style={styles.primaryButtonText}>Melden starten</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.sm },
  subtitle: { fontSize: 16, marginBottom: Spacing.xl },
  primaryButton: {
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
