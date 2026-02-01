import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
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

  const { data: result } = useQuery({
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
            borderColor: colors.border,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        <Pressable
          onPress={() => setViewMode('map')}
          style={[styles.toolbarBtn, viewMode === 'map' && { backgroundColor: colors.tint }]}
        >
          <Ionicons name="map" size={20} color={viewMode === 'map' ? '#fff' : colors.text} />
          <Text style={[styles.toolbarBtnText, { color: viewMode === 'map' ? '#fff' : colors.text }]}>Karte</Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('list')}
          style={[styles.toolbarBtn, viewMode === 'list' && { backgroundColor: colors.tint }]}
        >
          <Ionicons name="list" size={20} color={viewMode === 'list' ? '#fff' : colors.text} />
          <Text style={[styles.toolbarBtnText, { color: viewMode === 'list' ? '#fff' : colors.text }]}>Liste</Text>
        </Pressable>
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
          {incidents.length === 0 ? (
            <Text style={[styles.empty, { color: colors.icon }]}>Keine Vorfälle in den gewählten Filtern.</Text>
          ) : (
            incidents.map((inc) => (
              <Pressable
                key={inc.id}
                style={[styles.listRow, { borderBottomColor: colors.border }]}
                onPress={() => router.push(`/incident/${inc.id}`)}
              >
                <Text style={[styles.listCategory, { color: colors.tint }]}>
                  {INCIDENT_CATEGORY_SHORT[inc.category as IncidentCategory]}
                </Text>
                <Text style={[styles.listSnippet, { color: colors.text }]} numberOfLines={2}>
                  {inc.region_text ?? 'Region'} · {new Date(inc.occurred_at).toLocaleDateString('de-DE')}
                </Text>
                <Text style={[styles.listDesc, { color: colors.icon }]} numberOfLines={1}>
                  {inc.description}
                </Text>
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
          ]}
          onPress={() => router.push(`/incident/${selectedId}`)}
        >
          <Text style={[styles.previewTitle, { color: colors.text }]}>Vorfall anzeigen</Text>
          <Text style={[styles.previewSub, { color: colors.icon }]}>Tippen für Details</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  toolbarBtnText: { fontSize: 14 },
  map: { flex: 1 },
  listContainer: { flex: 1, padding: Spacing.lg },
  empty: { fontSize: 16, textAlign: 'center', marginTop: Spacing.xl },
  listRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  listCategory: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  listSnippet: { fontSize: 14, marginBottom: 2 },
  listDesc: { fontSize: 13 },
  previewCard: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  previewTitle: { fontSize: 16, fontWeight: '600' },
  previewSub: { fontSize: 14, marginTop: 2 },
});
