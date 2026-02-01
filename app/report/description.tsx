import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { validateDescriptionNoPII } from '@/lib/validation';
import { useReportStore } from '@/store/report-store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const HELP_TEXT =
  'Beschreibe den Vorfall sachlich. Keine Namen, keine Adressen, keine Telefonnummern oder andere Identifizierungen.';

export default function ReportDescriptionScreen() {
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.help, { color: colors.icon }]}>{HELP_TEXT}</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        placeholder="Beschreibung des Vorfalls…"
        placeholderTextColor={colors.icon}
        multiline
        numberOfLines={4}
        value={localDesc}
        onChangeText={setLocalDesc}
      />
      <Pressable
        style={styles.checkRow}
        onPress={() => setAgreed(!agreed)}
      >
        <View style={[styles.checkbox, agreed && { backgroundColor: colors.tint }]} />
        <Text style={[styles.checkLabel, { color: colors.text }]}>
          Ich nenne keine identifizierbaren Personen
        </Text>
      </Pressable>
      <Pressable style={[styles.primaryBtn, { backgroundColor: colors.tint }]} onPress={onNext}>
        <Text style={styles.primaryBtnText}>Weiter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl },
  help: { fontSize: 14, marginBottom: Spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, gap: Spacing.sm },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#888',
  },
  checkLabel: { flex: 1, fontSize: 14 },
  primaryBtn: {
    marginTop: 'auto',
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
