import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
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
        { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.icon }, { marginTop: 0 }]}>Einstellungen</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <Pressable style={styles.row} onPress={openLocationSettings}>
          <View style={[styles.rowIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="location-outline" size={22} color={colors.tint} />
          </View>
          <Text style={[styles.rowText, { color: colors.text }]}>Standort-Berechtigung öffnen</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </Pressable>
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <View style={[styles.rowIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.icon} />
          </View>
          <Text style={[styles.rowText, { color: colors.text }]}>Sicherheitsmodus</Text>
          <Text style={[styles.placeholder, { color: colors.icon }]}>Bald</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.icon }]}>Rechtliches &amp; Hilfe</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <View style={styles.row}>
          <Ionicons name="document-text-outline" size={22} color={colors.icon} />
          <Text style={[styles.rowText, { color: colors.text }]}>Datenschutz</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </View>
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Ionicons name="list-outline" size={22} color={colors.icon} />
          <Text style={[styles.rowText, { color: colors.text }]}>Regeln &amp; Nutzung</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </View>
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Ionicons name="help-circle-outline" size={22} color={colors.icon} />
          <Text style={[styles.rowText, { color: colors.text }]}>FAQ</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </View>
      </View>

      {ADMIN_MODE && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.icon }]}>Admin</Text>
          <Pressable
            style={[styles.card, styles.adminRow, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
            onPress={() => router.push('/admin')}
          >
            <Ionicons name="shield-outline" size={22} color={colors.icon} />
            <Text style={[styles.rowText, { color: colors.icon }]}>Moderation</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, fontSize: 16, fontWeight: '500' },
  rowDivider: { height: 1, marginLeft: Spacing.lg + 40 + Spacing.md },
  placeholder: { fontSize: 14, fontWeight: '500' },
  adminRow: { marginBottom: Spacing.xl },
});
