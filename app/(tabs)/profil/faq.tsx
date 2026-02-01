import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FAQ_ITEMS = [
  {
    q: 'Brauche ich einen Account?',
    a: 'Nein. NaziWatch funktioniert vollständig ohne Anmeldung. Meldungen sind anonym.',
  },
  {
    q: 'Wird mein Standort gespeichert?',
    a: 'Nein. Wir speichern nur grob gerundete Koordinaten für Vorfälle (z. B. ±500 m). Dein Gerätestandort wird nur lokal genutzt, um die Karte zu zentrieren.',
  },
  {
    q: 'Wann erscheint meine Meldung?',
    a: 'Nach redaktioneller Prüfung. Meldungen werden erst nach Freigabe veröffentlicht. Du erhältst keine Benachrichtigung – aus Datenschutzgründen.',
  },
  {
    q: 'Darf ich Namen oder Adressen nennen?',
    a: 'Nein. Wir lehnen personenbezogene Angaben ab. Beschreibe den Vorfall sachlich, ohne Einzelpersonen zu identifizieren.',
  },
  {
    q: 'Was passiert mit Fotos?',
    a: 'Metadaten (EXIF) werden entfernt. Bitte keine Gesichter oder identifizierbaren Personen abbilden. Fotos sind optional.',
  },
  {
    q: 'Warum wird meine Meldung abgelehnt?',
    a: 'Mögliche Gründe: personenbezogene Angaben, ungeeignete Inhalte, Spam oder unvollständige Angaben. Du erhältst keine Begründung – aus Anonymitätsgründen.',
  },
  {
    q: 'Was ist der Sicherheitsmodus?',
    a: 'Geplant: Der Sicherheitsmodus neutralisiert App-Namen und Icon, um die Nutzung in sensiblen Situationen zu schützen. Noch nicht verfügbar.',
  },
];

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
    >
      {FAQ_ITEMS.map((item, i) => (
        <View
          key={i}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
        >
          <View style={styles.row}>
            <Ionicons name="help-circle" size={22} color={colors.tint} />
            <Text style={[styles.question, { color: colors.text }]}>{item.q}</Text>
          </View>
          <Text style={[styles.answer, { color: colors.icon }]}>{item.a}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  question: { flex: 1, fontSize: 16, fontWeight: '600', lineHeight: 22 },
  answer: { fontSize: 15, lineHeight: 22, marginLeft: 30 },
});
