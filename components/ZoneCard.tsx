/**
 * ZoneCard.tsx
 * ────────────
 * Displays information about a single geofence zone.
 * Risk level drives the colour accent (red / orange / green).
 *
 * Props:
 *   zone      — Zone object from locationService
 *   onPress?  — optional tap handler
 *   active?   — if true, renders the card with a glowing border
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Zone } from '../services/locationService';
import StatusBadge from './StatusBadge';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  zone:     Zone;
  onPress?: () => void;
  active?:  boolean;
}

// ── Risk-level icon config (vector icons instead of emojis) ──
const RISK_ICON_CONFIG: Record<Zone['risk'], { name: string; color: string }> = {
  high:   { name: 'alert-circle',         color: '#FF4C4C' },
  medium: { name: 'alert-circle-outline',  color: '#FF7B2F' },
  low:    { name: 'checkmark-circle',      color: '#00FF88' },
};

const RISK_COLOR: Record<Zone['risk'], 'red' | 'orange' | 'green'> = {
  high:   'red',
  medium: 'orange',
  low:    'green',
};

const RISK_LABEL: Record<Zone['risk'], string> = {
  high:   'HIGH RISK',
  medium: 'MEDIUM',
  low:    'SAFE ZONE',
};

const ACCENT: Record<Zone['risk'], string> = {
  high:   'rgba(255,76,76,0.25)',
  medium: 'rgba(255,123,47,0.25)',
  low:    'rgba(0,255,136,0.25)',
};

export default function ZoneCard({ zone, onPress, active = false }: Props) {
  const iconCfg = RISK_ICON_CONFIG[zone.risk];

  return (
    <TouchableOpacity
      style={[styles.card, active && { borderColor: ACCENT[zone.risk] }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`Zone: ${zone.name}, Risk: ${zone.risk}`}
    >
      <View style={styles.row}>
        <Ionicons
          name={iconCfg.name as any}
          size={22}
          color={iconCfg.color}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{zone.name}</Text>
          <Text style={styles.coord}>
            {zone.center.lat.toFixed(4)}, {zone.center.lng.toFixed(4)}
          </Text>
        </View>
        <StatusBadge label={RISK_LABEL[zone.risk]} color={RISK_COLOR[zone.risk]} size="sm" />
      </View>
      {active && (
        <View style={styles.activeBanner}>
          <Ionicons name="location-sharp" size={13} color="#00E5FF" style={{ marginRight: 4 }} />
          <Text style={styles.activeText}>You are here</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:         { backgroundColor: '#121212', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, marginBottom: 10 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name:         { fontSize: 14, fontWeight: '700', color: '#F0F4FF', marginBottom: 2 },
  coord:        { fontSize: 11, color: '#6B7FA3' },
  activeBanner: { marginTop: 10, backgroundColor: 'rgba(0,229,255,0.06)', borderRadius: 8, padding: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  activeText:   { fontSize: 12, color: '#00E5FF', fontWeight: '600' },
});
