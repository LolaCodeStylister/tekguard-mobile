import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import MapView from 'react-native-maps';

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

  // ── Safe Walk Timer state ──
  const [walkTimerActive, setWalkTimerActive] = useState(false);
  const [walkSeconds, setWalkSeconds] = useState(0);
  const walkInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Discrete Actions menu ──
  const [discreteMenuOpen, setDiscreteMenuOpen] = useState(false);

  // ── Walk-timer tick ──
  useEffect(() => {
    if (walkTimerActive) {
      walkInterval.current = setInterval(() => setWalkSeconds(s => s + 1), 1000);
    } else if (walkInterval.current) {
      clearInterval(walkInterval.current);
      walkInterval.current = null;
    }
    return () => { if (walkInterval.current) clearInterval(walkInterval.current); };
  }, [walkTimerActive]);

  const formatTimer = useCallback((sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const handleFakeCall = useCallback(() => {
    setDiscreteMenuOpen(false);
    Alert.alert('📞 Incoming Call…', 'Simulating a phone call for your safety.\nShow this to excuse yourself.');
  }, []);

  const handleShareLocation = useCallback(() => {
    setDiscreteMenuOpen(false);
    Alert.alert('📍 Location Shared', 'Your live location has been sent to your emergency contacts.');
  }, []);

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

      {/* ── System Heartbeat Bar ── */}
      <View style={styles.heartbeatBar}>
        <View style={styles.heartbeatItem}>
          <View style={[styles.heartbeatDot, styles.heartbeatDotGreen]} />
          <Text style={styles.heartbeatLabel}>GPS: LOCKED</Text>
        </View>
        <View style={styles.heartbeatItem}>
          <View style={[styles.heartbeatDot, styles.heartbeatDotGreen]} />
          <Text style={styles.heartbeatLabel}>SENSORS: ACTIVE</Text>
        </View>
        <View style={styles.heartbeatItem}>
          <View style={[styles.heartbeatDot, styles.heartbeatDotGreen]} />
          <Text style={styles.heartbeatLabel}>NETWORK: SECURE</Text>
        </View>
      </View>

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

      {/* ── Center Map Area ── */}
      <View style={styles.mapContainer}>
        {/* Native MapView targeting KNUST campus */}
        <MapView
          style={styles.mapView}
          initialRegion={{
            latitude: 6.6731,
            longitude: -1.5674,
            latitudeDelta: 0.015,
            longitudeDelta: 0.012,
          }}
          showsUserLocation
          showsMyLocationButton={false}
          userInterfaceStyle="dark"
        />

        {/* ── Crowd Density Pins (floating over map) ── */}
        <View style={[styles.densityPin, { top: '18%', left: '15%' }]}>
          <Text style={styles.densityPinName}>Library</Text>
          <View style={[styles.densityBadge, styles.densityHigh]}>
            <Text style={styles.densityHighText}>👥 142 Active</Text>
          </View>
        </View>

        <View style={[styles.densityPin, { top: '55%', right: '10%' }]}>
          <Text style={styles.densityPinName}>Science Block</Text>
          <View style={[styles.densityBadge, styles.densityHigh]}>
            <Text style={styles.densityHighText}>👥 89 Active</Text>
          </View>
        </View>

        <View style={[styles.densityPin, { bottom: '15%', left: '22%' }]}>
          <Text style={styles.densityPinName}>Car Park B</Text>
          <View style={[styles.densityBadge, styles.densityLow]}>
            <Text style={styles.densityLowText}>👥 3 Active</Text>
          </View>
        </View>

        <View style={[styles.densityPin, { top: '30%', right: '25%' }]}>
          <Text style={styles.densityPinName}>Main Gate</Text>
          <View style={[styles.densityBadge, styles.densityMed]}>
            <Text style={styles.densityMedText}>👥 27 Active</Text>
          </View>
        </View>

        {/* ── Overlay: Safe Walk Timer ── */}
        <View style={styles.walkTimerOverlay}>
          <Text style={styles.walkTimerIcon}>🚶</Text>
          <Text style={styles.walkTimerTitle}>Safe Walk</Text>
          <Text style={styles.walkTimerClock}>{formatTimer(walkSeconds)}</Text>
          <TouchableOpacity
            style={[styles.walkTimerBtn, walkTimerActive && styles.walkTimerBtnStop]}
            onPress={() => {
              if (walkTimerActive) { setWalkTimerActive(false); setWalkSeconds(0); }
              else { setWalkTimerActive(true); }
            }}
            accessibilityLabel={walkTimerActive ? 'Stop walk timer' : 'Start walk timer'}
          >
            <Text style={styles.walkTimerBtnText}>{walkTimerActive ? 'STOP' : 'START'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Overlay: Discrete Actions menu ── */}
        <View style={styles.discreteOverlay}>
          <TouchableOpacity
            style={styles.discreteTrigger}
            onPress={() => setDiscreteMenuOpen(v => !v)}
            accessibilityLabel="Discrete actions menu"
          >
            <Text style={styles.discreteTriggerText}>⋮</Text>
          </TouchableOpacity>
          {discreteMenuOpen && (
            <View style={styles.discreteMenu}>
              <TouchableOpacity style={styles.discreteItem} onPress={handleFakeCall}>
                <Text style={styles.discreteItemIcon}>📞</Text>
                <Text style={styles.discreteItemText}>Fake Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.discreteItem} onPress={handleShareLocation}>
                <Text style={styles.discreteItemIcon}>📍</Text>
                <Text style={styles.discreteItemText}>Share Loc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.discreteItem} onPress={() => setDiscreteMenuOpen(false)}>
                <Text style={styles.discreteItemIcon}>🔕</Text>
                <Text style={styles.discreteItemText}>Silent SOS</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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

  // Heartbeat bar
  heartbeatBar:     { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(0,255,136,0.05)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.12)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 18 },
  heartbeatItem:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heartbeatDot:     { width: 6, height: 6, borderRadius: 3 },
  heartbeatDotGreen:{ backgroundColor: GREEN, shadowColor: GREEN, shadowOpacity: 0.9, shadowRadius: 3 },
  heartbeatLabel:   { fontSize: 9, fontWeight: '700', color: 'rgba(0,255,136,0.75)', letterSpacing: 0.8 },

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

  // ── Map area ──
  mapContainer:    { position: 'relative', marginBottom: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,212,255,0.12)' },
  mapView:         { height: 260, borderRadius: 16 },

  // ── Crowd-density pins ──
  densityPin:       { position: 'absolute', alignItems: 'center' },
  densityPinName:   { fontSize: 9, fontWeight: '700', color: 'rgba(240,244,255,0.7)', letterSpacing: 0.4, marginBottom: 3 },
  densityBadge:     { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  densityHigh:      { backgroundColor: 'rgba(0,255,136,0.12)', borderColor: 'rgba(0,255,136,0.30)' },
  densityHighText:  { fontSize: 9, fontWeight: '700', color: GREEN },
  densityMed:       { backgroundColor: 'rgba(0,212,255,0.12)', borderColor: 'rgba(0,212,255,0.30)' },
  densityMedText:   { fontSize: 9, fontWeight: '700', color: CYAN },
  densityLow:       { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' },
  densityLowText:   { fontSize: 9, fontWeight: '700', color: MUTED },

  // ── Safe-walk timer overlay ──
  walkTimerOverlay: { position: 'absolute', bottom: 14, left: 12, backgroundColor: 'rgba(6,13,24,0.92)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.18)', borderRadius: 14, padding: 10, alignItems: 'center', minWidth: 80 },
  walkTimerIcon:    { fontSize: 18, marginBottom: 2 },
  walkTimerTitle:   { fontSize: 9, fontWeight: '700', color: MUTED, letterSpacing: 0.6, marginBottom: 4 },
  walkTimerClock:   { fontSize: 18, fontWeight: '800', color: CYAN, fontVariant: ['tabular-nums'], marginBottom: 6 },
  walkTimerBtn:     { backgroundColor: 'rgba(0,212,255,0.15)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.35)', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  walkTimerBtnStop: { backgroundColor: 'rgba(255,76,76,0.15)', borderColor: 'rgba(255,76,76,0.35)' },
  walkTimerBtnText: { fontSize: 10, fontWeight: '700', color: TEXT },

  // ── Discrete actions overlay ──
  discreteOverlay:      { position: 'absolute', bottom: 14, right: 12, alignItems: 'flex-end' },
  discreteTrigger:      { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(6,13,24,0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  discreteTriggerText:  { fontSize: 20, color: TEXT, lineHeight: 22, fontWeight: '800' },
  discreteMenu:         { marginBottom: 8, backgroundColor: 'rgba(6,13,24,0.95)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)', borderRadius: 12, paddingVertical: 6, minWidth: 110 },
  discreteItem:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  discreteItemIcon:     { fontSize: 14 },
  discreteItemText:     { fontSize: 11, fontWeight: '600', color: TEXT },

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
