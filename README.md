# TekGuard Mobile

Student-facing React Native (Expo) app for the TekGuard campus safety system at KNUST.

## Project Structure

```
tekguard-mobile/
├── App.tsx                        # Root navigator (React Navigation native-stack)
├── screens/
│   ├── HomeScreen.tsx             # Main dashboard — system status, toggles, SOS entry
│   └── SOSScreen.tsx              # Active alert screen with countdown + dispatch
├── components/
│   ├── StatusBadge.tsx            # Coloured risk/status pill badge
│   └── ZoneCard.tsx               # Geofence zone display card
└── services/
    ├── locationService.ts         # expo-location — GPS tracking + zone resolution
    └── sensorService.ts           # expo-sensors — fall detection + DMS inactivity
```

## Features

| Feature | Package | File |
|---|---|---|
| Real-time GPS tracking | `expo-location` | `services/locationService.ts` |
| Geofence zone matching | `expo-location` | `services/locationService.ts` |
| Fall detection (accelerometer) | `expo-sensors` | `services/sensorService.ts` |
| Dead Man's Switch inactivity | `expo-sensors` | `services/sensorService.ts` |
| Screen routing | `@react-navigation/native-stack` | `App.tsx` |
| SOS alert flow | built-in | `screens/SOSScreen.tsx` |

## Running the App

```bash
cd tekguard-mobile
npm run start        # Opens Expo Dev Tools
# Scan QR with Expo Go app on your phone, or:
npm run android      # Requires Android emulator / device
```

## Zone Coordinates

Matches the web dashboard's `zoneData` exactly:

| Zone | Lat | Lng | Risk |
|---|---|---|---|
| Science Block | 6.6733 | -1.5673 | High |
| University Library | 6.6738 | -1.5684 | Low |
| Commercial Area | 6.6715 | -1.5745 | Medium |
| Sports Complex | 6.6694 | -1.5746 | Low |
| Student Hostel | 6.6756 | -1.5793 | Medium |
| Car Park C | 6.6742 | -1.5708 | High |

## Sensor Thresholds (sensorService.ts)

| Constant | Default | Description |
|---|---|---|
| `FALL_THRESHOLD` | 2.5g | Raw acceleration above this triggers a fall event |
| `STILLNESS_THRESHOLD` | 0.08g | Delta below this marks the user as stationary |
| `STILL_SAMPLE_LIMIT` | 60 samples | ~6 seconds of no motion before DMS warning |
