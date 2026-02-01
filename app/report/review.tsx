import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { canSubmit, recordSubmission } from '@/lib/cooldown';
import { roundCoordsForPrivacy } from '@/lib/rounding';
import { supabase } from '@/lib/supabase';
import { useReportStore } from '@/store/report-store';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_LABELS } from '@/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ReportReviewScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const draft = useReportStore();
  const [submitting, setSubmitting] = useState(false);

  const rounded =
    draft.lat !== null && draft.lon !== null && draft.precision_m !== null
      ? roundCoordsForPrivacy(draft.lat, draft.lon, draft.precision_m)
      : null;

  const onSubmit = async () => {
    if (
      !draft.category ||
      draft.lat === null ||
      draft.lon === null ||
      draft.precision_m === null ||
      !draft.occurred_at ||
      !draft.description.trim()
    ) {
      Alert.alert('Unvollständig', 'Bitte fülle alle Schritte aus.');
      return;
    }
    const { allowed, retryAfterSec } = await canSubmit();
    if (!allowed) {
      Alert.alert(
        'Zu viele Meldungen',
        `Bitte warte noch ${Math.ceil((retryAfterSec ?? 0) / 60)} Minuten. (Anti-Spam)`
      );
      return;
    }
    setSubmitting(true);
    try {
      const { lat, lon } = rounded!;
      const { data: incident, error: incError } = await supabase
        .from('incidents')
        .insert({
          category: draft.category,
          description: draft.description.trim(),
          occurred_at: draft.occurred_at,
          lat,
          lon,
          precision_m: draft.precision_m,
          region_text: null,
          status: 'pending',
        })
        .select('id')
        .single();

      if (incError) {
        Alert.alert('Fehler', incError.message);
        return;
      }
      await recordSubmission();
      useReportStore.getState().reset();
      router.replace({ pathname: '/report/success', params: { id: incident?.id ?? '' } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.note, { color: colors.icon }]}>
        Wird erst nach Prüfung veröffentlicht. Deine Meldung ist anonym.
      </Text>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.icon }]}>Kategorie</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {draft.category ? INCIDENT_CATEGORY_LABELS[draft.category as IncidentCategory] : '–'}
        </Text>
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.icon }]}>Ort (gerundet)</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {rounded ? `${rounded.lat.toFixed(4)}, ${rounded.lon.toFixed(4)} (±${draft.precision_m}m)` : '–'}
        </Text>
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.icon }]}>Zeitpunkt</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {draft.occurred_at ? new Date(draft.occurred_at).toLocaleString('de-DE') : '–'}
        </Text>
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.icon }]}>Beschreibung</Text>
        <Text style={[styles.value, { color: colors.text }]}>{draft.description || '–'}</Text>
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.icon }]}>Medien</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {draft.mediaUris.length > 0 ? `${draft.mediaUris.length} Datei(en)` : 'Keine'}
        </Text>
      </View>
      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
        onPress={onSubmit}
        disabled={submitting}
      >
        <Text style={styles.primaryBtnText}>{submitting ? 'Wird gesendet…' : 'Absenden'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xl * 2 },
  note: { fontSize: 14, marginBottom: Spacing.lg },
  row: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  label: { fontSize: 12, marginBottom: 2 },
  value: { fontSize: 16 },
  primaryBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
