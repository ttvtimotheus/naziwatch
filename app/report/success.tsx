import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Meldung eingegangen</Text>
      {id ? (
        <Text style={[styles.id, { color: colors.icon }]}>Referenz: {id.slice(0, 8)}…</Text>
      ) : null}
      <Text style={[styles.note, { color: colors.text }]}>
        Deine Meldung wird redaktionell geprüft. Sie erscheint erst nach Freigabe. Keine Rückverfolgung möglich – vollständig anonym.
      </Text>
      <Pressable
        style={[styles.btn, { backgroundColor: colors.tint }]}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.btnText}>Zurück zur Startseite</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  id: { fontSize: 14, marginBottom: Spacing.md },
  note: { fontSize: 16, marginBottom: Spacing.xl },
  btn: { paddingVertical: Spacing.lg, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
