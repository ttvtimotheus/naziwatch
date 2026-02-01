import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CONTENT = `
Zweck
NaziWatch dient der anonymen Meldung und Sichtbarmachung rechtsextremer Vorfälle und Propaganda – ohne personenbezogene Beschuldigungen.

Regeln für Meldungen
• Sachlich beschreiben. Keine Namen von Personen, keine genauen Adressen, keine Telefonnummern.
• Keine Hetze gegen Einzelpersonen. Der Fokus liegt auf Vorfällen, Symbolik und Strukturen, nicht auf individueller Denunziation.
• Meldungen werden vor Veröffentlichung redaktionell geprüft. Ungeeignete oder personenbezogene Inhalte werden abgelehnt.

Nutzung der App
• Die angezeigten Vorfälle sind redaktionell freigegeben. Du nutzt die App auf eigene Verantwortung.
• Keine Weitergabe von Inhalten zur Hetze oder zur Identifizierung von Personen.

Haftung
• Wir übernehmen keine Haftung für die Inhalte einzelner Meldungen. Bei rechtlichen Hinweisen wende dich an die angegebene Kontaktmöglichkeit (falls vorhanden).

Änderungen
• Diese Regeln können angepasst werden. Aktuelle Version: Profil → Regeln & Nutzung.
`;

export default function RegelnScreen() {
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
