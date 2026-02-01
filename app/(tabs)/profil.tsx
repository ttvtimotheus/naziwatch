import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ADMIN_MODE } from '@/lib/env';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfilTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const openLocationSettings = () => {
    Linking.openSettings();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Einstellungen</Text>

      <Pressable
        style={[styles.row, { borderBottomColor: colors.border }]}
        onPress={openLocationSettings}
      >
        <Ionicons name="location-outline" size={22} color={colors.icon} />
        <Text style={[styles.rowText, { color: colors.text }]}>Standort-Berechtigung öffnen</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
      </Pressable>

      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Ionicons name="shield-checkmark-outline" size={22} color={colors.icon} />
        <Text style={[styles.rowText, { color: colors.text }]}>Sicherheitsmodus</Text>
        <Text style={[styles.placeholder, { color: colors.icon }]}>Bald verfügbar</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>
        Rechtliches &amp; Hilfe
      </Text>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.rowText, { color: colors.text }]}>Datenschutz</Text>
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.rowText, { color: colors.text }]}>Regeln &amp; Nutzung</Text>
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.rowText, { color: colors.text }]}>FAQ</Text>
      </View>

      {ADMIN_MODE && (
        <Pressable
          style={[styles.row, { borderBottomColor: colors.border }]}
          onPress={() => router.push('/admin')}
        >
          <Text style={[styles.rowText, { color: colors.icon }]}>Moderation (Admin)</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  rowText: { flex: 1, fontSize: 16 },
  placeholder: { fontSize: 14 },
});
