import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DEFAULT_REGION, getCurrentPosition } from '@/lib/location';
import { PRECISION_OPTIONS } from '@/lib/rounding';
import { useReportStore } from '@/store/report-store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

export default function ReportLocationScreen() {
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
    queryFn: getCurrentPosition,
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
      <View style={[styles.overlay, { backgroundColor: colors.background }]}>
        <Text style={[styles.hint, { color: colors.icon }]}>
          Tippe auf die Karte für den ungefähren Ort. Genauigkeit wählen:
        </Text>
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
        <Pressable style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={centerOnUser}>
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Mein Standort</Text>
        </Pressable>
        <Pressable style={[styles.primaryBtn, { backgroundColor: colors.tint }]} onPress={onNext}>
          <Text style={styles.primaryBtnText}>Weiter</Text>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  hint: { fontSize: 14, marginBottom: Spacing.md },
  precisionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  precisionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  precisionBtnText: { fontSize: 14 },
  secondaryBtn: {
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  secondaryBtnText: { fontSize: 16 },
  primaryBtn: { paddingVertical: Spacing.lg, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
