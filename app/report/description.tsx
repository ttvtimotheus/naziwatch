import { ReportStepIndicator } from '@/components/report-step-indicator';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { validateDescriptionNoPII } from '@/lib/validation';
import { useReportStore } from '@/store/report-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HELP_TEXT =
  'Beschreibe den Vorfall sachlich. Wir speichern keine personenbezogenen Daten.';

const DONT_LIST = [
  'Keine Namen von Personen',
  'Keine genauen Adressen oder Telefonnummern',
  'Keine Identifizierung von Einzelpersonen',
];

export default function ReportDescriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { description, setDescription } = useReportStore();
  const [agreed, setAgreed] = useState(false);
  const [localDesc, setLocalDesc] = useState(description);

  const onNext = () => {
    const result = validateDescriptionNoPII(localDesc);
    if (!result.valid) {
      Alert.alert('Hinweis', result.message);
      return;
    }
    if (!agreed) {
      Alert.alert('Hinweis', 'Bitte bestätige, dass du keine identifizierbaren Personen nennst.');
      return;
    }
    setDescription(localDesc);
    router.push('/report/media');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
    >
      <ReportStepIndicator current={4} />
      <Text style={[styles.title, { color: colors.text }]}>Beschreibung</Text>
      <Text style={[styles.help, { color: colors.icon }]}>{HELP_TEXT}</Text>

      <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Was ist passiert? Sachlich beschreiben…"
          placeholderTextColor={colors.icon}
          multiline
          numberOfLines={5}
          value={localDesc}
          onChangeText={setLocalDesc}
        />
      </View>

      <View style={[styles.dontCard, { backgroundColor: colors.card }, Shadow.sm]}>
        <Text style={[styles.dontTitle, { color: colors.icon }]}>Bitte nicht angeben:</Text>
        {DONT_LIST.map((item, i) => (
          <View key={i} style={styles.dontRow}>
            <Ionicons name="close-circle-outline" size={18} color={colors.icon} />
            <Text style={[styles.dontItem, { color: colors.icon }]}>{item}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.checkCard, { backgroundColor: colors.card, borderColor: agreed ? colors.tint : colors.border }, Shadow.sm]}
        onPress={() => setAgreed(!agreed)}
      >
        <View style={[styles.checkbox, agreed && { backgroundColor: colors.tint }]}>
          {agreed && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
        <Text style={[styles.checkLabel, { color: colors.text }]}>
          Ich nenne keine identifizierbaren Personen und halte mich an die Hinweise.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.tint }, Shadow.md]}
        onPress={onNext}
      >
        <Text style={styles.primaryBtnText}>Weiter</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  help: { fontSize: 15, marginBottom: Spacing.lg, lineHeight: 22 },
  inputCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  input: {
    minHeight: 140,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
  },
  dontCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  dontTitle: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  dontRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  dontItem: { fontSize: 14 },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 22 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
