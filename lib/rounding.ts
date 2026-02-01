/**
 * Coordinate rounding for privacy: no exact location stored or displayed.
 */

export type Coords = { latitude: number; longitude: number };

/**
 * Round coordinates so that the point is blurred to a grid cell.
 * precision_m: 200, 500, 2000 etc. – approximate radius in meters.
 * We approximate: 1° lat ≈ 111km, 1° lon ≈ 111*cos(lat) km.
 */
export function roundCoordsForPrivacy(
  lat: number,
  lon: number,
  precision_m: number
): { lat: number; lon: number } {
  const metersPerDegLat = 111_000;
  const metersPerDegLon = 111_000 * Math.cos((lat * Math.PI) / 180);
  const stepLat = precision_m / metersPerDegLat;
  const stepLon = precision_m / metersPerDegLon;
  const roundedLat = Math.round(lat / stepLat) * stepLat;
  const roundedLon = Math.round(lon / stepLon) * stepLon;
  return { lat: roundedLat, lon: roundedLon };
}

/**
 * Precision options for reporting (meters).
 */
export const PRECISION_OPTIONS = [
  { value: 200, label: '200 m' },
  { value: 500, label: '500 m' },
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
] as const;
