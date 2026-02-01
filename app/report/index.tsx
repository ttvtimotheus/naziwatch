import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReportStore } from '@/store/report-store';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_LABELS } from '@/types';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

const CATEGORIES: IncidentCategory[] = [
  'propaganda',
  'threat',
  'violence',
  'online',
  'event',
  'other',
];

export default function ReportCategoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { category, setCategory } = useReportStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: colors.text }]}>Wähle die Kategorie des Vorfalls</Text>
      {CATEGORIES.map((cat) => (
        <Pressable
          key={cat}
          onPress={() => {
            setCategory(cat);
            router.push('/report/location');
          }}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
            category === cat && { borderColor: colors.tint, borderWidth: 2 },
          ]}
        >
          <Text style={[styles.cardText, { color: colors.text }]}>
            {INCIDENT_CATEGORY_LABELS[cat]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xl * 2 },
  label: { fontSize: 16, marginBottom: Spacing.lg },
  card: {
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardText: { fontSize: 16 },
});
