import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchIncidentById } from '@/lib/incidents-api';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_LABELS } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: incident, isLoading, isError, refetch } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => fetchIncidentById(id ?? ''),
    enabled: !!id,
  });

  if (isLoading || !incident) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{isLoading ? 'Lade…' : 'Vorfall nicht gefunden.'}</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Fehler beim Laden.</Text>
        <Pressable style={[styles.retryBtn, { backgroundColor: colors.tint }]} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Erneut laden</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.badge, { backgroundColor: colors.tint }]}>
        <Text style={styles.badgeText}>
          {INCIDENT_CATEGORY_LABELS[incident.category as IncidentCategory]}
        </Text>
      </View>
      <Text style={[styles.region, { color: colors.icon }]}>
        {incident.region_text ?? 'Grobe Region'}
      </Text>
      <Text style={[styles.date, { color: colors.icon }]}>
        {new Date(incident.occurred_at).toLocaleString('de-DE')}
      </Text>
      <Text style={[styles.description, { color: colors.text }]}>
        {incident.description}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errorText: { marginBottom: Spacing.md },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 8 },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  content: { padding: Spacing.xl },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  badgeText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  region: { fontSize: 14, marginBottom: 4 },
  date: { fontSize: 14, marginBottom: Spacing.lg },
  description: { fontSize: 16, lineHeight: 24 },
});
