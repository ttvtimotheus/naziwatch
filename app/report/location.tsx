import { ReportStepIndicator } from '@/components/report-step-indicator';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DEFAULT_REGION, getCurrentPosition, requestLocationPermission } from '@/lib/location';
import { PRECISION_OPTIONS } from '@/lib/rounding';
import { useReportStore } from '@/store/report-store';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const mapRef = useRef<MapView>(null);
  const { lat, lon, precision_m, setLocation } = useReportStore();
  const [pin, setPin] = useState<{ lat: number; lon: number } | null>(
    lat !== null && lon !== null ? { lat, lon } : null
  );
  const [precision, setPrecision] = useState<number>(precision_m ?? 500);

  const { data: userLocation } = useQuery({
    queryKey: ['location'],
    queryFn: async () => {
      await requestLocationPermission();
      return getCurrentPosition();
    },
    staleTime: 60_000,
  });

  const region = useMemo(() => {
    if (pin) {
      return {
        latitude: pin.lat,
        longitude: pin.lon,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    const coords = userLocation ?? DEFAULT_REGION;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [pin, userLocation]);

  const onMapPress = useCallback((e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPin({ lat: latitude, lon: longitude });
  }, []);

  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...region,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
      setPin({ lat: userLocation.latitude, lon: userLocation.longitude });
    } else {
      Alert.alert('Standort', 'Standortberechtigung fehlt. Tippe auf die Karte, um einen Ort zu wählen.');
    }
  }, [userLocation, region]);

  const onNext = () => {
    if (!pin) {
      Alert.alert('Ort wählen', 'Bitte tippe auf die Karte, um den ungefähren Ort zu setzen.');
      return;
    }
    setLocation(pin.lat, pin.lon, precision);
    router.push('/report/time');
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={onMapPress}
        showsUserLocation
        provider={Platform.OS === 'ios' ? undefined : undefined}
      >
        {pin && (
          <Marker coordinate={{ latitude: pin.lat, longitude: pin.lon }} />
        )}
      </MapView>
      <View
        style={[
          styles.overlay,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.lg },
          Shadow.lg,
        ]}
      >
        <ReportStepIndicator current={2} />
        <Text style={[styles.title, { color: colors.text }]}>Wo war es?</Text>
        <Text style={[styles.hint, { color: colors.icon }]}>
          Tippe auf die Karte für den ungefähren Ort. Wir speichern nur grobe Koordinaten (Datenschutz).
        </Text>
        <View style={[styles.precisionCard, { backgroundColor: colors.card }, Shadow.sm]}>
          <Text style={[styles.precisionLabel, { color: colors.icon }]}>Ungenauigkeit (Privacy)</Text>
          <View style={styles.precisionRow}>
            {PRECISION_OPTIONS.map(({ value, label }) => (
              <Pressable
                key={value}
                onPress={() => setPrecision(value)}
                style={[
                  styles.precisionBtn,
                  { borderColor: colors.border },
                  precision === value && { backgroundColor: colors.tint },
                ]}
              >
                <Text
                  style={[
                    styles.precisionBtnText,
                    { color: precision === value ? '#fff' : colors.text },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable
          style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
          onPress={centerOnUser}
        >
          <Ionicons name="locate" size={20} color={colors.tint} />
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Mein Standort</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.tint }, Shadow.md]}
          onPress={onNext}
          disabled={!pin}
        >
          <Text style={styles.primaryBtnText}>Weiter</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, width: '100%' },
  overlay: {
    padding: Spacing.lg,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
  hint: { fontSize: 14, marginBottom: Spacing.lg, lineHeight: 20 },
  precisionCard: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  precisionLabel: { fontSize: 12, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  precisionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  precisionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  precisionBtnText: { fontSize: 14, fontWeight: '600' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
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
