import { ReportStepIndicator } from '@/components/report-step-indicator';
import { CATEGORY_ICONS } from '@/constants/category-icons';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReportStore } from '@/store/report-store';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_LABELS } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
      <ReportStepIndicator current={1} />
      <Text style={[styles.title, { color: colors.text }]}>Was ist passiert?</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Wähle die passende Kategorie für den Vorfall.
      </Text>
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
            category === cat && { borderColor: colors.tint, borderWidth: 2, backgroundColor: `${colors.tint}10` },
            Shadow.sm,
          ]}
        >
          <View style={[styles.cardIconWrap, { backgroundColor: category === cat ? colors.tint : colors.background }]}>
            <Ionicons
              name={CATEGORY_ICONS[cat] as any}
              size={24}
              color={category === cat ? '#fff' : colors.icon}
            />
          </View>
          <Text style={[styles.cardText, { color: colors.text }]}>
            {INCIDENT_CATEGORY_LABELS[cat]}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xxl * 2 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  subtitle: { fontSize: 15, marginBottom: Spacing.xl, lineHeight: 22 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, fontSize: 16, fontWeight: '600' },
});
