import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CONTENT = `
NaziWatch erhebt und speichert keine personenbezogenen Daten. Es gibt keine Anmeldung, keine E-Mail und keine Namen.

Standort
• Wir speichern keinen exakten Standort. Nur gerundete Koordinaten (z. B. ±500 m) werden für die Darstellung von Vorfällen verwendet.
• Dein Gerätestandort wird nur lokal genutzt, um die Karte zu zentrieren. Er wird nicht an unsere Server übertragen.

Meldungen
• Meldungen sind anonym. Es werden keine IP-Adressen, Geräte-IDs oder andere Identifikatoren dauerhaft gespeichert.
• Beschreibungen werden vor Veröffentlichung redaktionell geprüft. Wir lehnen personenbezogene Angaben ab.

Medien
• Optional hochgeladene Fotos werden ohne EXIF-Metadaten gespeichert. Wir empfehlen, keine Gesichter oder identifizierbaren Personen abzubilden.

Technik
• Keine Tracking-SDKs, keine Analytics, keine Werbenetzwerke.
• Verbindung zu Supabase (Backend) nur für das Laden und Einreichen von Vorfällen. Supabase hostet in der EU.

Änderungen
• Diese Hinweise können aktualisiert werden. Die aktuelle Version findest du in der App unter Profil → Datenschutz.
`;

export default function DatenschutzScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <Text style={[styles.text, { color: colors.text }]}>{CONTENT.trim()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  text: { fontSize: 15, lineHeight: 24 },
});
