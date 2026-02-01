import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchIncidentById } from '@/lib/incidents-api';
import { getSignedMediaUrl } from '@/lib/media-urls';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_LABELS } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IncidentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: incident, isLoading, isError, refetch } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => fetchIncidentById(id ?? ''),
    enabled: !!id,
  });

  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!incident?.media?.length) return;
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const m of incident.media ?? []) {
        if (m.type !== 'image' || cancelled) continue;
        const url = await getSignedMediaUrl(m.url);
        if (url && !cancelled) next[m.url] = url;
      }
      if (!cancelled) setMediaUrls((prev) => ({ ...prev, ...next }));
    })();
    return () => { cancelled = true; };
  }, [incident?.media]);

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
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl }]}
    >
      <View style={[styles.badge, { backgroundColor: colors.tint }, Shadow.sm]}>
        <Text style={styles.badgeText}>
          {INCIDENT_CATEGORY_LABELS[incident.category as IncidentCategory]}
        </Text>
      </View>
      <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={20} color={colors.icon} />
          <Text style={[styles.metaLabel, { color: colors.icon }]}>Region</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{incident.region_text ?? 'Grobe Region'}</Text>
        </View>
        <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.icon} />
          <Text style={[styles.metaLabel, { color: colors.icon }]}>Zeitpunkt</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {new Date(incident.occurred_at).toLocaleString('de-DE')}
          </Text>
        </View>
      </View>
      <Text style={[styles.descLabel, { color: colors.icon }]}>Beschreibung</Text>
      <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
        <Text style={[styles.description, { color: colors.text }]}>{incident.description}</Text>
      </View>
      {incident.media && incident.media.length > 0 && (
        <>
          <Text style={[styles.descLabel, { color: colors.icon }]}>Medien</Text>
          <View style={styles.mediaWrap}>
            {incident.media
              .filter((m) => m.type === 'image')
              .map((m) => {
                const url = mediaUrls[m.url];
                return url ? (
                  <Image
                    key={m.id}
                    source={{ uri: url }}
                    style={styles.mediaImage}
                    contentFit="cover"
                  />
                ) : (
                  <View key={m.id} style={[styles.mediaPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="image-outline" size={32} color={colors.icon} />
                  </View>
                );
              })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errorText: { marginBottom: Spacing.md },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.sm },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  content: { padding: Spacing.lg },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  metaCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  metaLabel: { fontSize: 13, fontWeight: '600', width: 80 },
  metaValue: { flex: 1, fontSize: 15, fontWeight: '500' },
  metaDivider: { height: 1, marginVertical: Spacing.md, marginLeft: 28 },
  descLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  descCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  description: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  mediaWrap: { gap: Spacing.md, marginBottom: Spacing.xl },
  mediaImage: { width: '100%', height: 220, borderRadius: Radius.lg },
  mediaPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
