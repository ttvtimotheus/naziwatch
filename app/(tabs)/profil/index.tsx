import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ADMIN_MODE } from '@/lib/env';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function ProfilTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const openLocationSettings = () => {
    Linking.openSettings();
  };

  const onSicherheitsmodus = () => {
    Alert.alert(
      'Sicherheitsmodus',
      'Bald verfügbar: App-Name und Icon werden neutralisiert, um die Nutzung in sensiblen Situationen zu schützen.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.icon }, styles.firstSectionTitle]}>Einstellungen</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <Pressable style={styles.row} onPress={openLocationSettings}>
          <View style={[styles.rowIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="location-outline" size={22} color={colors.tint} />
          </View>
          <Text style={[styles.rowText, { color: colors.text }]}>Standort-Berechtigung öffnen</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </Pressable>
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
        <Pressable style={styles.row} onPress={onSicherheitsmodus}>
          <View style={[styles.rowIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.icon} />
          </View>
          <Text style={[styles.rowText, { color: colors.text }]}>Sicherheitsmodus</Text>
          <Text style={[styles.placeholder, { color: colors.icon }]}>Bald</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.icon }]}>Rechtliches & Hilfe</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <Pressable style={styles.row} onPress={() => router.push('/profil/datenschutz')}>
          <View style={[styles.rowIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="document-text-outline" size={22} color={colors.tint} />
          </View>
          <Text style={[styles.rowText, { color: colors.text }]}>Datenschutz</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </Pressable>
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
        <Pressable style={styles.row} onPress={() => router.push('/profil/regeln')}>
          <View style={[styles.rowIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="list-outline" size={22} color={colors.tint} />
          </View>
          <Text style={[styles.rowText, { color: colors.text }]}>Regeln & Nutzung</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </Pressable>
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
        <Pressable style={styles.row} onPress={() => router.push('/profil/faq')}>
          <View style={[styles.rowIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="help-circle-outline" size={22} color={colors.tint} />
          </View>
          <Text style={[styles.rowText, { color: colors.text }]}>FAQ</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </Pressable>
      </View>

      {ADMIN_MODE && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.icon }]}>Admin</Text>
          <Pressable
            style={[styles.card, styles.row, styles.adminRow, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
            onPress={() => router.push('/admin')}
          >
            <View style={[styles.rowIconWrap, { backgroundColor: colors.background }]}>
              <Ionicons name="shield-outline" size={22} color={colors.tint} />
            </View>
            <Text style={[styles.rowText, { color: colors.text }]}>Moderation</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </Pressable>
        </>
      )}

      <Text style={[styles.footerVersion, { color: colors.icon }]}>NaziWatch · Version {APP_VERSION}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  firstSectionTitle: { marginTop: 0 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
  },
  footerVersion: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
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
