import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchIncidents } from '@/lib/incidents-api';
import { DEFAULT_REGION, getCurrentPosition, requestLocationPermission } from '@/lib/location';
import { useHomeFilters } from '@/store/home-filters-store';
import type { IncidentCategory } from '@/types';
import { INCIDENT_CATEGORY_SHORT } from '@/types';

const SNAP_POINTS = ['45%', '90%'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { timeRange, category, setTimeRange, setCategory } = useHomeFilters();

  const {
    data: location,
    isSuccess: locationQuerySettled,
    refetch: refetchLocation,
  } = useQuery({
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
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [location]);

  const {
    data: incidentsResult,
    isLoading,
    isError: incidentsError,
    isRefetching,
    refetch: refetchIncidents,
  } = useQuery({
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
    } else {
      refetchLocation();
    }
  }, [location, region, refetchLocation]);

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

      <Pressable
        style={[
          styles.topLabel,
          {
            backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)',
            top: insets.top + Spacing.sm,
            ...Shadow.md,
          },
        ]}
        onPress={location ? undefined : () => refetchLocation()}
      >
        <Ionicons name="location" size={16} color={colors.tint} style={styles.topLabelIcon} />
        <Text style={[styles.topLabelText, { color: colors.text }]}>
          {location ? 'In deiner Nähe' : locationQuerySettled ? 'Standort erlauben' : 'Standort…'}
        </Text>
      </Pressable>

      <Pressable style={[styles.centerButton, Shadow.lg]} onPress={centerOnUser}>
        <Ionicons name="locate" size={26} color={colors.tint} />
      </Pressable>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={SNAP_POINTS}
        handleIndicatorStyle={{ backgroundColor: colors.icon, width: 40 }}
        backgroundStyle={[
          { backgroundColor: colors.background, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl },
          Shadow.lg,
        ]}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetchIncidents()}
              tintColor={colors.tint}
            />
          }
        >
          {/* Search row */}
          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
            <View style={[styles.searchIconWrap, { backgroundColor: colors.tint }]}>
              <Ionicons name="search" size={22} color="#fff" />
            </View>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Ort, Kategorie oder Zeitraum"
              placeholderTextColor={colors.icon}
              editable={false}
            />
            <Pressable style={[styles.filterBtn, { borderLeftColor: colors.border }]}>
              <Ionicons name="options-outline" size={22} color={colors.text} />
              <Text style={[styles.filterBtnText, { color: colors.text }]}>Filter</Text>
            </Pressable>
          </View>

          {/* Quick filter chips */}
          <View style={styles.chipsSection}>
            <Text style={[styles.chipLabel, { color: colors.icon }]}>Zeitraum</Text>
            <View style={styles.chipsWrap}>
              {(['today', '7days', '30days'] as const).map((range) => (
                <Pressable
                  key={range}
                  onPress={() => setTimeRange(timeRange === range ? null : range)}
                  style={[
                    styles.chip,
                    { backgroundColor: timeRange === range ? colors.tint : colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.chipText, { color: timeRange === range ? '#fff' : colors.text }]}>
                    {range === 'today' ? 'Heute' : range === '7days' ? '7 Tage' : '30 Tage'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.chipsSection}>
            <Text style={[styles.chipLabel, { color: colors.icon }]}>Kategorie</Text>
            <View style={styles.chipsWrap}>
              {(['propaganda', 'threat', 'violence', 'online', 'event', 'other'] as IncidentCategory[]).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(category === cat ? null : cat)}
                  style={[
                    styles.chip,
                    { backgroundColor: category === cat ? colors.tint : colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.chipText, { color: category === cat ? '#fff' : colors.text }]}>
                    {INCIDENT_CATEGORY_SHORT[cat]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={[styles.badgeChip, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.tint} />
            <Text style={[styles.chipText, { color: colors.text }]}>Nur geprüft</Text>
          </View>

          {/* Incident list preview */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Neueste Vorfälle</Text>
            {incidents.length > 0 && (
              <Text style={[styles.sectionCount, { color: colors.icon }]}>{incidents.length}</Text>
            )}
          </View>
          {incidentsError ? (
            <View style={[styles.errorCard, { backgroundColor: colors.card }, Shadow.sm]}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.icon} />
              <Text style={[styles.placeholder, { color: colors.icon }]}>Fehler beim Laden.</Text>
              <Pressable
                style={[styles.retryBtn, { backgroundColor: colors.tint }]}
                onPress={() => refetchIncidents()}
              >
                <Text style={styles.retryBtnText}>Erneut laden</Text>
              </Pressable>
            </View>
          ) : isLoading ? (
            <View style={[styles.placeholderCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.placeholder, { color: colors.icon }]}>Lade…</Text>
            </View>
          ) : incidents.length === 0 ? (
            <View style={[styles.placeholderCard, { backgroundColor: colors.card }]}>
              <Ionicons name="document-text-outline" size={28} color={colors.icon} />
              <Text style={[styles.placeholder, { color: colors.icon }]}>Keine Vorfälle in den gewählten Filtern.</Text>
            </View>
          ) : (
            incidents.slice(0, 5).map((inc) => (
              <Pressable
                key={inc.id}
                style={[styles.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
                onPress={() => router.push(`/incident/${inc.id}`)}
              >
                <View style={styles.incidentCardTop}>
                  <View style={[styles.incidentCardBadge, { backgroundColor: colors.tint }]}>
                    <Text style={styles.incidentCardBadgeText}>
                      {INCIDENT_CATEGORY_SHORT[inc.category as IncidentCategory]}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                </View>
                <Text style={[styles.incidentSnippet, { color: colors.text }]} numberOfLines={1}>
                  {inc.region_text ?? 'Region'} · {new Date(inc.occurred_at).toLocaleDateString('de-DE')}
                </Text>
                <Text style={[styles.incidentDesc, { color: colors.icon }]} numberOfLines={2}>
                  {inc.description}
                </Text>
              </Pressable>
            ))
          )}

          {/* Promo card */}
          <Pressable
            style={[styles.promoCard, { backgroundColor: colors.tint }, Shadow.md]}
            onPress={() => router.push('/report/')}
          >
            <View style={styles.promoIconWrap}>
              <Ionicons name="add-circle" size={32} color="#fff" />
            </View>
            <View style={styles.promoTextWrap}>
              <Text style={styles.promoTitle}>Vorfall melden</Text>
              <Text style={styles.promoSub}>Anonym · Keine Anmeldung · Datenschutzorientiert</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.9)" />
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
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    gap: Spacing.sm,
  },
  topLabelIcon: { marginRight: 2 },
  topLabelText: { fontSize: 15, fontWeight: '600' },
  centerButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: '50%',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: { paddingBottom: Spacing.xxl * 2, paddingHorizontal: Spacing.lg },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  searchIconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
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
  filterBtnText: { fontSize: 14, fontWeight: '500' },
  chipsSection: { marginBottom: Spacing.md },
  chipLabel: { fontSize: 12, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  sectionCount: { fontSize: 14, fontWeight: '500' },
  placeholder: { fontSize: 15 },
  errorCard: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  placeholderCard: {
    padding: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  retryBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.sm },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  incidentCard: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  incidentCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  incidentCardBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  incidentCardBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  incidentSnippet: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  incidentDesc: { fontSize: 13, lineHeight: 18 },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  promoIconWrap: { marginRight: Spacing.sm },
  promoTextWrap: { flex: 1 },
  promoTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  promoSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
});
