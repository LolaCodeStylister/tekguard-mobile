import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// ── Types ──────────────────────────────────────────────────────────────────
type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: Props) {
  const [systemActive, setSystemActive] = useState(true);
  const [dmsEnabled, setDmsEnabled] = useState(true);
  const [fallEnabled, setFallEnabled] = useState(true);
  const [activeZone, setActiveZone] = useState('Science Block');

  // Pulse animation for the live status dot
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#060D18" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>⚡ TekGuard</Text>
          <Text style={styles.tagline}>Student Safety — KNUST</Text>
        </View>
        <View style={styles.liveChip}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* ── Status Banner ── */}
      <View style={[styles.statusBanner, systemActive ? styles.bannerActive : styles.bannerOff]}>
        <Text style={styles.statusIcon}>{systemActive ? '🛡️' : '⚠️'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>
            TekGuard Mobile System {systemActive ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.statusSub}>
            {systemActive
              ? 'All sensors online · GPS tracking on'
              : 'Tap to re-enable monitoring'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, systemActive ? styles.toggleOn : styles.toggleOff]}
          onPress={() => setSystemActive(v => !v)}
          accessibilityLabel="Toggle system power"
        >
          <Text style={styles.toggleText}>{systemActive ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Active Zone ── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>📍 Current Zone</Text>
        <Text style={styles.zoneName}>{activeZone}</Text>
        <Text style={styles.zoneCoord}>KNUST Campus · GPS Active</Text>
      </View>

      {/* ── Feature Toggles ── */}
      <View style={styles.row}>
        {/* DMS */}
        <View style={[styles.featureCard, dmsEnabled && styles.featureCardOn]}>
          <Text style={styles.featureIcon}>⏱️</Text>
          <Text style={styles.featureTitle}>Dead Man's{'\n'}Switch</Text>
          <Text style={styles.featureSub}>{dmsEnabled ? '3 min interval' : 'Disabled'}</Text>
          <TouchableOpacity
            style={[styles.smallToggle, dmsEnabled ? styles.toggleOn : styles.toggleOff]}
            onPress={() => setDmsEnabled(v => !v)}
            accessibilityLabel="Toggle Dead Man Switch"
          >
            <Text style={styles.toggleText}>{dmsEnabled ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        {/* Fall Detection */}
        <View style={[styles.featureCard, fallEnabled && styles.featureCardOn]}>
          <Text style={styles.featureIcon}>🤸</Text>
          <Text style={styles.featureTitle}>Fall{'\n'}Detection</Text>
          <Text style={styles.featureSub}>{fallEnabled ? 'Accelerometer on' : 'Disabled'}</Text>
          <TouchableOpacity
            style={[styles.smallToggle, fallEnabled ? styles.toggleOn : styles.toggleOff]}
            onPress={() => setFallEnabled(v => !v)}
            accessibilityLabel="Toggle fall detection"
          >
            <Text style={styles.toggleText}>{fallEnabled ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SOS Button ── */}
      <TouchableOpacity
        style={styles.sosBtn}
        onPress={() => navigation.navigate('SOS')}
        activeOpacity={0.8}
        accessibilityLabel="Trigger SOS alert"
        accessibilityRole="button"
      >
        <Text style={styles.sosBtnText}>🆘  TRIGGER SOS ALERT</Text>
        <Text style={styles.sosBtnSub}>Notifies security + emergency contacts</Text>
      </TouchableOpacity>

      {/* ── Info Footer ── */}
      <Text style={styles.footer}>
        Powered by TekGuard Security · KNUST Campus Safety Network
      </Text>
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const CYAN    = '#00D4FF';
const GREEN   = '#00FF88';
const RED     = '#FF4C4C';
const ORANGE  = '#FF7B2F';
const PURPLE  = '#7B2FFF';
const BG      = '#060D18';
const CARD    = '#0E1A2E';
const BORDER  = 'rgba(255,255,255,0.08)';
const TEXT    = '#F0F4FF';
const MUTED   = '#6B7FA3';

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: BG },
  content:     { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 56, paddingBottom: 40 },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brand:       { fontSize: 22, fontWeight: '800', color: TEXT, letterSpacing: 0.5 },
  tagline:     { fontSize: 12, color: MUTED, marginTop: 2 },
  liveChip:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,255,136,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN, shadowColor: GREEN, shadowOpacity: 0.8, shadowRadius: 4 },
  liveText:    { fontSize: 10, fontWeight: '700', color: GREEN, letterSpacing: 1 },

  // Status banner
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16 },
  bannerActive: { backgroundColor: 'rgba(0,212,255,0.07)', borderColor: 'rgba(0,212,255,0.2)' },
  bannerOff:    { backgroundColor: 'rgba(255,76,76,0.07)', borderColor: 'rgba(255,76,76,0.2)' },
  statusIcon:   { fontSize: 26 },
  statusTitle:  { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 2 },
  statusSub:    { fontSize: 11, color: MUTED },
  toggleBtn:    { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  toggleOn:     { backgroundColor: 'rgba(0,212,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.35)' },
  toggleOff:    { backgroundColor: 'rgba(255,76,76,0.15)', borderWidth: 1, borderColor: 'rgba(255,76,76,0.35)' },
  toggleText:   { fontSize: 11, fontWeight: '700', color: TEXT },

  // Card
  card:         { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 16, marginBottom: 16 },
  cardLabel:    { fontSize: 11, color: MUTED, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  zoneName:     { fontSize: 20, fontWeight: '800', color: CYAN, marginBottom: 4 },
  zoneCoord:    { fontSize: 12, color: MUTED },

  // Feature row
  row:          { flexDirection: 'row', gap: 12, marginBottom: 20 },
  featureCard:  { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 14, alignItems: 'flex-start' },
  featureCardOn:{ borderColor: 'rgba(0,212,255,0.2)', backgroundColor: 'rgba(0,212,255,0.04)' },
  featureIcon:  { fontSize: 24, marginBottom: 8 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 4, lineHeight: 18 },
  featureSub:   { fontSize: 11, color: MUTED, marginBottom: 12 },
  smallToggle:  { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },

  // SOS Button
  sosBtn:       { backgroundColor: RED, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 24, shadowColor: RED, shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  sosBtnText:   { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  sosBtnSub:    { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Footer
  footer:       { textAlign: 'center', fontSize: 11, color: MUTED, lineHeight: 18 },
});
