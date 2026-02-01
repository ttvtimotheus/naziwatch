import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReportStore } from '@/store/report-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ReportTimeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { occurred_at, setOccurredAt } = useReportStore();
  const [useNow, setUseNow] = useState(!occurred_at);
  const [date, setDate] = useState(occurred_at ? new Date(occurred_at) : new Date());

  const onNext = () => {
    setOccurredAt(useNow ? new Date().toISOString() : date.toISOString());
    router.push('/report/description');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable
        onPress={() => setUseNow(true)}
        style={[
          styles.option,
          { backgroundColor: colors.card, borderColor: colors.border },
          useNow && { borderColor: colors.tint, borderWidth: 2 },
        ]}
      >
        <Text style={[styles.optionText, { color: colors.text }]}>Jetzt</Text>
      </Pressable>
      <Pressable
        onPress={() => setUseNow(false)}
        style={[
          styles.option,
          { backgroundColor: colors.card, borderColor: colors.border },
          !useNow && { borderColor: colors.tint, borderWidth: 2 },
        ]}
      >
        <Text style={[styles.optionText, { color: colors.text }]}>Datum & Uhrzeit wählen</Text>
      </Pressable>
      {!useNow && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => d && setDate(d)}
          style={styles.picker}
        />
      )}
      <Pressable style={[styles.primaryBtn, { backgroundColor: colors.tint }]} onPress={onNext}>
        <Text style={styles.primaryBtnText}>Weiter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl },
  option: {
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  optionText: { fontSize: 16 },
  picker: { marginVertical: Spacing.lg },
  primaryBtn: {
    marginTop: 'auto',
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
