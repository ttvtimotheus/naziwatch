import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchIncidents } from '@/lib/incidents-api';
import { DEFAULT_REGION, getCurrentPosition, requestLocationPermission } from '@/lib/location';
import { useHomeFilters } from '@/store/home-filters-store';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_SHORT } from '@/types';

export default function EntdeckenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { timeRange, category } = useHomeFilters();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: location } = useQuery({
    queryKey: ['location'],
    queryFn: async () => {
      await requestLocationPermission();
      return getCurrentPosition();
    },
    staleTime: 60_000,
  });
  const region = useMemo(() => {
    const coords = location ?? DEFAULT_REGION;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [location]);

  const {
    data: result,
    isError: incidentsError,
    refetch: refetchIncidents,
  } = useQuery({
    queryKey: ['incidents', 'explore', timeRange, category],
    queryFn: () =>
      fetchIncidents({
        filters: { timeRange: timeRange ?? undefined, category: category ?? undefined, onlyApproved: true },
        pageSize: 50,
      }),
  });
  const incidents = result?.data ?? [];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.toolbar,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: Spacing.sm,
            paddingHorizontal: Spacing.sm,
            ...Shadow.sm,
          },
        ]}
      >
        <View style={[styles.segmentedControl, { backgroundColor: colors.card }]}>
          <Pressable
            onPress={() => setViewMode('map')}
            style={[styles.segmentedBtn, viewMode === 'map' && { backgroundColor: colors.tint }, Shadow.sm]}
          >
            <Ionicons name="map" size={20} color={viewMode === 'map' ? '#fff' : colors.text} />
            <Text style={[styles.segmentedBtnText, { color: viewMode === 'map' ? '#fff' : colors.text }]}>Karte</Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('list')}
            style={[styles.segmentedBtn, viewMode === 'list' && { backgroundColor: colors.tint }, Shadow.sm]}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? '#fff' : colors.text} />
            <Text style={[styles.segmentedBtnText, { color: viewMode === 'list' ? '#fff' : colors.text }]}>Liste</Text>
          </Pressable>
        </View>
      </View>

      {viewMode === 'map' ? (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          provider={Platform.OS === 'ios' ? undefined : undefined}
        >
          {incidents.map((inc) => (
            <Marker
              key={inc.id}
              coordinate={{ latitude: inc.lat, longitude: inc.lon }}
              title={INCIDENT_CATEGORY_SHORT[inc.category as IncidentCategory]}
              onCalloutPress={() => router.push(`/incident/${inc.id}`)}
              onPress={() => setSelectedId(inc.id)}
            />
          ))}
        </MapView>
      ) : (
        <View style={[styles.listContainer, { backgroundColor: colors.background }]}>
          {incidentsError ? (
            <View style={styles.errorBlock}>
              <Text style={[styles.empty, { color: colors.icon }]}>Fehler beim Laden.</Text>
              <Pressable
                style={[styles.retryBtn, { backgroundColor: colors.tint }]}
                onPress={() => refetchIncidents()}
              >
                <Text style={styles.retryBtnText}>Erneut laden</Text>
              </Pressable>
            </View>
          ) : incidents.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Ionicons name="document-text-outline" size={40} color={colors.icon} />
              <Text style={[styles.empty, { color: colors.icon }]}>Keine Vorfälle in den gewählten Filtern.</Text>
            </View>
          ) : (
            incidents.map((inc) => (
              <Pressable
                key={inc.id}
                style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
                onPress={() => router.push(`/incident/${inc.id}`)}
              >
                <View style={[styles.listCardBadge, { backgroundColor: colors.tint }]}>
                  <Text style={styles.listCardBadgeText}>
                    {INCIDENT_CATEGORY_SHORT[inc.category as IncidentCategory]}
                  </Text>
                </View>
                <Text style={[styles.listSnippet, { color: colors.text }]} numberOfLines={1}>
                  {inc.region_text ?? 'Region'} · {new Date(inc.occurred_at).toLocaleDateString('de-DE')}
                </Text>
                <Text style={[styles.listDesc, { color: colors.icon }]} numberOfLines={2}>
                  {inc.description}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} style={styles.listCardChevron} />
              </Pressable>
            ))
          )}
        </View>
      )}

      {viewMode === 'map' && selectedId && (
        <Pressable
          style={[
            styles.previewCard,
            { backgroundColor: colors.background, bottom: insets.bottom + Spacing.xl },
            Shadow.lg,
          ]}
          onPress={() => router.push(`/incident/${selectedId}`)}
        >
          <Text style={[styles.previewTitle, { color: colors.text }]}>Vorfall anzeigen</Text>
          <Text style={[styles.previewSub, { color: colors.icon }]}>Tippen für Details</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { paddingHorizontal: Spacing.lg },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: 4,
    gap: 4,
  },
  segmentedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  segmentedBtnText: { fontSize: 15, fontWeight: '600' },
  map: { flex: 1 },
  listContainer: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
  empty: { fontSize: 16, textAlign: 'center', marginTop: Spacing.sm },
  emptyCard: {
    marginTop: Spacing.xl,
    padding: Spacing.xxl,
    borderRadius: Radius.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorBlock: { marginTop: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.sm },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  listCard: {
    padding: Spacing.lg,
    paddingRight: Spacing.xl + 24,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  listCardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  listCardBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  listSnippet: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  listDesc: { fontSize: 13, lineHeight: 18 },
  listCardChevron: { position: 'absolute', right: Spacing.md, top: Spacing.lg },
  previewCard: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  previewTitle: { flex: 1, fontSize: 17, fontWeight: '700' },
  previewSub: { flex: 1, fontSize: 14 },
});
