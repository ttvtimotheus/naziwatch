import { ReportStepIndicator } from '@/components/report-step-indicator';
import { CATEGORY_ICONS } from '@/constants/category-icons';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { canSubmit, recordSubmission } from '@/lib/cooldown';
import { roundCoordsForPrivacy } from '@/lib/rounding';
import { supabase } from '@/lib/supabase';
import { uploadIncidentMedia } from '@/lib/upload-media';
import { useReportStore } from '@/store/report-store';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_LABELS } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportReviewScreen() {
  const insets = useSafeAreaInsets();
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
      Alert.alert('Unvollständig', 'Bitte fülle alle Pflichtschritte aus.');
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
      const { data: incidentId, error: incError } = await supabase.rpc('insert_incident', {
        p_category: draft.category,
        p_description: draft.description.trim(),
        p_occurred_at: draft.occurred_at,
        p_lat: lat,
        p_lon: lon,
        p_precision_m: draft.precision_m,
        p_region_text: null,
        p_status: 'pending',
      });

      if (incError) {
        Alert.alert('Fehler', incError.message);
        return;
      }
      const incidentIdStr = incidentId ?? '';
      if (incidentIdStr && draft.mediaUris.length > 0) {
        for (let i = 0; i < draft.mediaUris.length; i++) {
          try {
            await uploadIncidentMedia(
              incidentIdStr,
              draft.mediaUris[i].uri,
              draft.mediaUris[i].type
            );
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Upload fehlgeschlagen';
            Alert.alert('Medien-Upload', `Foto ${i + 1}: ${msg}`);
          }
        }
      }
      await recordSubmission();
      useReportStore.getState().reset();
      router.replace({ pathname: '/report/success', params: { id: incidentIdStr } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
    >
      <ReportStepIndicator current={6} />
      <Text style={[styles.title, { color: colors.text }]}>Überprüfen & absenden</Text>

      <View style={[styles.noteCard, { backgroundColor: `${colors.tint}15`, borderColor: colors.tint }, Shadow.sm]}>
        <Ionicons name="information-circle" size={24} color={colors.tint} />
        <View style={styles.noteTextWrap}>
          <Text style={[styles.noteTitle, { color: colors.text }]}>Anonym & erst nach Prüfung sichtbar</Text>
          <Text style={[styles.noteSub, { color: colors.icon }]}>
            Deine Meldung wird redaktionell geprüft. Sie erscheint erst nach Freigabe. Keine Rückverfolgung möglich.
          </Text>
        </View>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name={CATEGORY_ICONS[draft.category as IncidentCategory] as any} size={22} color={colors.tint} />
          </View>
          <View style={styles.summaryTextWrap}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>Kategorie</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {draft.category ? INCIDENT_CATEGORY_LABELS[draft.category as IncidentCategory] : '–'}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryRow}>
          <View style={[styles.summaryIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="location-outline" size={22} color={colors.tint} />
          </View>
          <View style={styles.summaryTextWrap}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>Ort (gerundet)</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {rounded ? `±${draft.precision_m}m · ${rounded.lat.toFixed(4)}, ${rounded.lon.toFixed(4)}` : '–'}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryRow}>
          <View style={[styles.summaryIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="calendar-outline" size={22} color={colors.tint} />
          </View>
          <View style={styles.summaryTextWrap}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>Zeitpunkt</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {draft.occurred_at ? new Date(draft.occurred_at).toLocaleString('de-DE') : '–'}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryRow}>
          <View style={[styles.summaryIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="document-text-outline" size={22} color={colors.tint} />
          </View>
          <View style={styles.summaryTextWrap}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>Beschreibung</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={3}>
              {draft.description || '–'}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryRow}>
          <View style={[styles.summaryIconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name="images-outline" size={22} color={colors.tint} />
          </View>
          <View style={styles.summaryTextWrap}>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>Medien</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {draft.mediaUris.length > 0 ? `${draft.mediaUris.length} Datei(en)` : 'Keine'}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.tint }, Shadow.md]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <Text style={styles.primaryBtnText}>Wird gesendet…</Text>
        ) : (
          <>
            <Ionicons name="send" size={22} color="#fff" />
            <Text style={styles.primaryBtnText}>Meldung absenden</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.xl },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  noteTextWrap: { flex: 1 },
  noteTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  noteSub: { fontSize: 14, lineHeight: 20 },
  summaryCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  summaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextWrap: { flex: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  summaryDivider: { height: 1, marginVertical: Spacing.md, marginLeft: 44 + Spacing.md },
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
