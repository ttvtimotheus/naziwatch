/**
 * Location utilities: permission, current position, and rounding for privacy.
 */

import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

/**
 * Request foreground location permission. Returns status.
 */
export async function requestLocationPermission(): Promise<Location.PermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status;
}

/**
 * Get current permission status (no request).
 */
export async function getLocationPermissionStatus(): Promise<Location.PermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status;
}

/**
 * Get last known or current position. Returns null if permission denied or error.
 */
export async function getCurrentPosition(): Promise<Coords | null> {
  const status = await getLocationPermissionStatus();
  if (status !== 'granted') return null;
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  } catch {
    return null;
  }
}

/**
 * Default region for map when no location (e.g. Germany center).
 */
export const DEFAULT_REGION: Coords = { latitude: 51.1657, longitude: 10.4515 };
