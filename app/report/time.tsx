import { ReportStepIndicator } from '@/components/report-step-indicator';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReportStore } from '@/store/report-store';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportTimeScreen() {
  const insets = useSafeAreaInsets();
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
    >
      <ReportStepIndicator current={3} />
      <Text style={[styles.title, { color: colors.text }]}>Wann war es?</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Wähle den ungefähren Zeitpunkt des Vorfalls.
      </Text>

      <Pressable
        onPress={() => setUseNow(true)}
        style={[
          styles.option,
          { backgroundColor: colors.card, borderColor: colors.border },
          useNow && { borderColor: colors.tint, borderWidth: 2, backgroundColor: `${colors.tint}12` },
          Shadow.sm,
        ]}
      >
        <View style={[styles.optionIconWrap, { backgroundColor: useNow ? colors.tint : colors.background }]}>
          <Ionicons name="time-outline" size={24} color={useNow ? '#fff' : colors.icon} />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>Jetzt</Text>
          <Text style={[styles.optionSub, { color: colors.icon }]}>Vor wenigen Minuten</Text>
        </View>
        {useNow && <Ionicons name="checkmark-circle" size={24} color={colors.tint} />}
      </Pressable>

      <Pressable
        onPress={() => setUseNow(false)}
        style={[
          styles.option,
          { backgroundColor: colors.card, borderColor: colors.border },
          !useNow && { borderColor: colors.tint, borderWidth: 2, backgroundColor: `${colors.tint}12` },
          Shadow.sm,
        ]}
      >
        <View style={[styles.optionIconWrap, { backgroundColor: !useNow ? colors.tint : colors.background }]}>
          <Ionicons name="calendar-outline" size={24} color={!useNow ? '#fff' : colors.icon} />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>Datum & Uhrzeit</Text>
          <Text style={[styles.optionSub, { color: colors.icon }]}>Manuell wählen</Text>
        </View>
        {!useNow && <Ionicons name="checkmark-circle" size={24} color={colors.tint} />}
      </Pressable>

      {!useNow && (
        <View style={[styles.pickerCard, { backgroundColor: colors.card }, Shadow.sm]}>
          <DateTimePicker
            value={date}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => d && setDate(d)}
            style={styles.picker}
          />
        </View>
      )}

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
  subtitle: { fontSize: 15, marginBottom: Spacing.xl, lineHeight: 22 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: { flex: 1 },
  optionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  optionSub: { fontSize: 14 },
  pickerCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  picker: { marginVertical: Spacing.sm },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
