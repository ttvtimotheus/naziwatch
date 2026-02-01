import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MeldenTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + Spacing.xxl,
          paddingBottom: insets.bottom + Spacing.xxl,
          paddingHorizontal: Spacing.xl,
        },
      ]}
    >
      <View style={[styles.heroIconWrap, { backgroundColor: colors.card }]}>
        <Ionicons name="megaphone-outline" size={56} color={colors.tint} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Vorfall melden</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Starte den anonymen Meldeablauf. Keine Anmeldung, keine personenbezogenen Daten – nur sachliche Angaben.
      </Text>
      <View style={styles.bullets}>
        <View style={styles.bulletRow}>
          <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
          <Text style={[styles.bulletText, { color: colors.text }]}>Vollständig anonym</Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
          <Text style={[styles.bulletText, { color: colors.text }]}>Prüfung vor Veröffentlichung</Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
          <Text style={[styles.bulletText, { color: colors.text }]}>Kein exakter Standort</Text>
        </View>
      </View>
      <Pressable
        style={[styles.primaryButton, { backgroundColor: colors.tint }, Shadow.md]}
        onPress={() => router.push('/report/')}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.primaryButtonText}>Melden starten</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  title: { fontSize: 28, fontWeight: '800', marginBottom: Spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: Spacing.xl, textAlign: 'center', lineHeight: 22 },
  bullets: { marginBottom: Spacing.xxl, gap: Spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bulletText: { fontSize: 15, fontWeight: '500' },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg + 4,
    borderRadius: Radius.lg,
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
