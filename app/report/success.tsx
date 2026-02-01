import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

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
      <View style={[styles.iconWrap, { backgroundColor: `${colors.tint}20` }, Shadow.md]}>
        <Ionicons name="checkmark-circle" size={72} color={colors.tint} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Meldung eingegangen</Text>
      {id ? (
        <Text style={[styles.id, { color: colors.icon }]}>Referenz: {id.slice(0, 8)}…</Text>
      ) : null}
      <Text style={[styles.note, { color: colors.text }]}>
        Deine Meldung wird redaktionell geprüft. Sie erscheint erst nach Freigabe. Keine Rückverfolgung möglich – vollständig anonym.
      </Text>
      <View style={[styles.bullets, { backgroundColor: colors.card }, Shadow.sm]}>
        <View style={styles.bulletRow}>
          <Ionicons name="shield-checkmark" size={22} color={colors.tint} />
          <Text style={[styles.bulletText, { color: colors.text }]}>Anonym gespeichert</Text>
        </View>
        <View style={styles.bulletRow}>
          <Ionicons name="time-outline" size={22} color={colors.tint} />
          <Text style={[styles.bulletText, { color: colors.text }]}>Prüfung vor Veröffentlichung</Text>
        </View>
      </View>
      <Pressable
        style={[styles.btn, { backgroundColor: colors.tint }, Shadow.md]}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.btnText}>Zurück zur Startseite</Text>
        <Ionicons name="home" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: Spacing.sm, textAlign: 'center' },
  id: { fontSize: 14, marginBottom: Spacing.md, textAlign: 'center' },
  note: { fontSize: 16, marginBottom: Spacing.xl, textAlign: 'center', lineHeight: 24 },
  bullets: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  bulletText: { fontSize: 15, fontWeight: '600', flex: 1 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.lg,
    width: '100%',
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
