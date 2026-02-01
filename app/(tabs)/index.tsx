import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchIncidents } from '@/lib/incidents-api';
import { DEFAULT_REGION, getCurrentPosition } from '@/lib/location';
import { useHomeFilters } from '@/store/home-filters-store';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_SHORT } from '@/types';

const SNAP_POINTS = ['45%', '90%'];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { timeRange, category, setTimeRange, setCategory } = useHomeFilters();

  const { data: location } = useQuery({
    queryKey: ['location'],
    queryFn: getCurrentPosition,
    staleTime: 60_000,
  });
  const region = useMemo(() => {
    const coords = location ?? DEFAULT_REGION;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [location]);

  const { data: incidentsResult, isLoading } = useQuery({
    queryKey: ['incidents', 'home', timeRange, category],
    queryFn: () =>
      fetchIncidents({
        filters: { timeRange: timeRange ?? undefined, category: category ?? undefined, onlyApproved: true },
        pageSize: 30,
      }),
  });
  const incidents = incidentsResult?.data ?? [];

  const centerOnUser = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        ...region,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location, region]);

  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        provider={Platform.OS === 'ios' ? undefined : undefined}
      >
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            coordinate={{ latitude: inc.lat, longitude: inc.lon }}
            title={INCIDENT_CATEGORY_SHORT[inc.category as IncidentCategory]}
            onCalloutPress={() => router.push(`/incident/${inc.id}`)}
          />
        ))}
      </MapView>

      <View style={[styles.topLabel, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' }]}>
        <Text style={[styles.topLabelText, { color: colors.text }]}>In deiner Nähe</Text>
      </View>

      <Pressable style={styles.centerButton} onPress={centerOnUser}>
        <Ionicons name="locate" size={24} color={colors.tint} />
      </Pressable>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={SNAP_POINTS}
        handleIndicatorStyle={{ backgroundColor: colors.icon }}
        backgroundStyle={{ backgroundColor: colors.background }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {/* Search row */}
          <View style={[styles.searchRow, { borderColor: colors.border }]}>
            <View style={[styles.searchIconWrap, { backgroundColor: colors.tint }]}>
              <Ionicons name="search" size={20} color="#fff" />
            </View>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Suchen nach Ort, Kategorie, Zeitraum"
              placeholderTextColor={colors.icon}
              editable={false}
            />
            <Pressable style={[styles.filterBtn, { borderColor: colors.border }]}>
              <Ionicons name="options-outline" size={20} color={colors.text} />
              <Text style={[styles.filterBtnText, { color: colors.text }]}>Filter</Text>
            </Pressable>
          </View>

          {/* Quick filter chips */}
          <View style={styles.chipsRow}>
            <Text style={[styles.chipLabel, { color: colors.icon }]}>Zeitraum:</Text>
            {(['today', '7days', '30days'] as const).map((range) => (
              <Pressable
                key={range}
                onPress={() => setTimeRange(timeRange === range ? null : range)}
                style={[
                  styles.chip,
                  timeRange === range && { backgroundColor: colors.tint },
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: timeRange === range ? '#fff' : colors.text },
                  ]}
                >
                  {range === 'today' ? 'Heute' : range === '7days' ? '7 Tage' : '30 Tage'}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chipsRow}>
            <Text style={[styles.chipLabel, { color: colors.icon }]}>Kategorie:</Text>
            {(['propaganda', 'threat', 'violence', 'online', 'event', 'other'] as IncidentCategory[]).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(category === cat ? null : cat)}
                style={[
                  styles.chip,
                  category === cat && { backgroundColor: colors.tint },
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: category === cat ? '#fff' : colors.text },
                  ]}
                >
                  {INCIDENT_CATEGORY_SHORT[cat]}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chipsRow}>
            <View style={[styles.chip, { backgroundColor: colors.card }]}>
              <Text style={[styles.chipText, { color: colors.text }]}>Nur geprüft</Text>
            </View>
          </View>

          {/* Incident list preview */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Neueste Vorfälle</Text>
          {isLoading ? (
            <Text style={[styles.placeholder, { color: colors.icon }]}>Lade…</Text>
          ) : incidents.length === 0 ? (
            <Text style={[styles.placeholder, { color: colors.icon }]}>Keine Vorfälle in den gewählten Filtern.</Text>
          ) : (
            incidents.slice(0, 5).map((inc) => (
              <Pressable
                key={inc.id}
                style={[styles.incidentRow, { borderBottomColor: colors.border }]}
                onPress={() => router.push(`/incident/${inc.id}`)}
              >
                <Text style={[styles.incidentCategory, { color: colors.tint }]}>
                  {INCIDENT_CATEGORY_SHORT[inc.category as IncidentCategory]}
                </Text>
                <Text style={[styles.incidentSnippet, { color: colors.text }]} numberOfLines={2}>
                  {inc.region_text ?? 'Region'} · {new Date(inc.occurred_at).toLocaleDateString('de-DE')}
                </Text>
                <Text style={[styles.incidentDesc, { color: colors.icon }]} numberOfLines={1}>
                  {inc.description}
                </Text>
              </Pressable>
            ))
          )}

          {/* Promo card */}
          <Pressable
            style={[styles.promoCard, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/report/')}
          >
            <Text style={styles.promoTitle}>Vorfall melden</Text>
            <Text style={styles.promoSub}>Anonym und datenschutzorientiert</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topLabel: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  topLabelText: { fontSize: 14, fontWeight: '500' },
  centerButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: '50%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sheetContent: { paddingBottom: Spacing.xl * 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  searchIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderLeftWidth: 1,
  },
  filterBtnText: { fontSize: 14 },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  chipLabel: { fontSize: 12, marginRight: 4 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  placeholder: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  incidentRow: {
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  incidentCategory: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  incidentSnippet: { fontSize: 14, marginBottom: 2 },
  incidentDesc: { fontSize: 13 },
  promoCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: 16,
  },
  promoTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  promoSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
});
