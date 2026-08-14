/**
 * locationService.ts
 * ──────────────────
 * Handles expo-location permissions and real-time GPS tracking.
 * Resolves the student's current KNUST geofence zone by comparing
 * device coordinates against the zoneData radius definitions.
 */

import * as Location from 'expo-location';

// ── Zone definitions (mirrors the web dashboard's zoneData) ────────────────
export interface Zone {
  id: string;
  name: string;
  risk: 'high' | 'medium' | 'low';
  center: { lat: number; lng: number };
  radius: number; // metres
}

export const KNUST_ZONES: Zone[] = [
  { id: 'science',  name: 'Science Block',       risk: 'high',   center: { lat: 6.6733, lng: -1.5673 }, radius: 130 },
  { id: 'library',  name: 'University Library',  risk: 'low',    center: { lat: 6.6738, lng: -1.5684 }, radius: 110 },
  { id: 'market',   name: 'Commercial Area',     risk: 'medium', center: { lat: 6.6715, lng: -1.5745 }, radius: 120 },
  { id: 'sports',   name: 'Sports Complex',      risk: 'low',    center: { lat: 6.6694, lng: -1.5746 }, radius: 150 },
  { id: 'hostel',   name: 'Student Hostel',      risk: 'medium', center: { lat: 6.6756, lng: -1.5793 }, radius: 140 },
  { id: 'carpark',  name: 'Car Park C',          risk: 'high',   center: { lat: 6.6742, lng: -1.5708 }, radius: 100 },
];

// ── Haversine distance (metres) ────────────────────────────────────────────
function haversineMetres(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Permission helper ──────────────────────────────────────────────────────
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

// ── Resolve the current zone from a coordinate pair ────────────────────────
export function resolveZone(lat: number, lng: number): Zone | null {
  return (
    KNUST_ZONES.find(zone => {
      const dist = haversineMetres(lat, lng, zone.center.lat, zone.center.lng);
      return dist <= zone.radius;
    }) ?? null
  );
}

// ── Subscribe to real-time location updates ────────────────────────────────
export async function watchPosition(
  onUpdate: (coords: Location.LocationObjectCoords, zone: Zone | null) => void
): Promise<Location.LocationSubscription | null> {
  const granted = await requestLocationPermission();
  if (!granted) return null;

  return Location.watchPositionAsync(
    {
      accuracy:          Location.Accuracy.High,
      distanceInterval:  10,   // metres between updates
      timeInterval:      5000, // ms minimum between updates
    },
    location => {
      const { latitude: lat, longitude: lng } = location.coords;
      const zone = resolveZone(lat, lng);
      onUpdate(location.coords, zone);
    }
  );
}
