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
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

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

  // ── Fake Call modal state ──
  const [fakeCallVisible, setFakeCallVisible] = useState(false);
  const fakeCallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Location Sharing state ──
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [personalContacts, setPersonalContacts] = useState<{ id: string; name: string; phone: string }[]>([
    { id: '1', name: 'Roommate', phone: '+233 24 555 0101' },
    { id: '2', name: 'Mom',      phone: '+233 20 888 0202' },
  ]);

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

  // Clean up fake call timer on unmount
  useEffect(() => {
    return () => { if (fakeCallTimer.current) clearTimeout(fakeCallTimer.current); };
  }, []);

  const formatTimer = useCallback((sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const handleFakeCall = useCallback(() => {
    setDiscreteMenuOpen(false);
    // 3-second delay so the user can lower their phone naturally
    fakeCallTimer.current = setTimeout(() => {
      setFakeCallVisible(true);
    }, 3000);
  }, []);

  const dismissFakeCall = useCallback(() => {
    setFakeCallVisible(false);
  }, []);

  const handleShareLocation = useCallback(() => {
    setDiscreteMenuOpen(false);
    setIsSharingLocation(true);
  }, []);

  const removeContact = useCallback((id: string) => {
    setPersonalContacts(prev => prev.filter(c => c.id !== id));
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

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
        <View style={styles.brandRow}>
          <Ionicons name="shield-checkmark" size={22} color={CYAN} style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.brand}>TekGuard</Text>
            <Text style={styles.tagline}>Student Safety — KNUST</Text>
          </View>
        </View>
        <View style={styles.liveChip}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* ── Status Banner ── */}
      <View style={[styles.statusBanner, systemActive ? styles.bannerActive : styles.bannerOff]}>
        {systemActive
          ? <Ionicons name="shield-checkmark" size={26} color={CYAN} />
          : <Ionicons name="warning" size={26} color={RED} />
        }
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
        <View style={styles.cardLabelRow}>
          <Ionicons name="location-sharp" size={13} color={MUTED} style={{ marginRight: 4 }} />
          <Text style={styles.cardLabel}>Current Zone</Text>
        </View>
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
        >
          {/* ── Crowd Density Markers (geo-pinned to the map) ── */}
          <Marker
            coordinate={{ latitude: 6.6745, longitude: -1.5680 }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.densityPin}>
              <Text style={styles.densityPinName}>Library</Text>
              <View style={[styles.densityBadge, styles.densityHigh]}>
                <Feather name="users" size={8} color={GREEN} style={{ marginRight: 3 }} />
                <Text style={styles.densityHighText}>142 Active</Text>
              </View>
            </View>
          </Marker>

          <Marker
            coordinate={{ latitude: 6.6731, longitude: -1.5674 }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.densityPin}>
              <Text style={styles.densityPinName}>Science Block</Text>
              <View style={[styles.densityBadge, styles.densityHigh]}>
                <Feather name="users" size={8} color={GREEN} style={{ marginRight: 3 }} />
                <Text style={styles.densityHighText}>89 Active</Text>
              </View>
            </View>
          </Marker>

          <Marker
            coordinate={{ latitude: 6.6720, longitude: -1.5660 }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.densityPin}>
              <Text style={styles.densityPinName}>Car Park B</Text>
              <View style={[styles.densityBadge, styles.densityLow]}>
                <Feather name="users" size={8} color={MUTED} style={{ marginRight: 3 }} />
                <Text style={styles.densityLowText}>3 Active</Text>
              </View>
            </View>
          </Marker>

          <Marker
            coordinate={{ latitude: 6.6715, longitude: -1.5650 }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.densityPin}>
              <Text style={styles.densityPinName}>Main Gate</Text>
              <View style={[styles.densityBadge, styles.densityMed]}>
                <Feather name="users" size={8} color={CYAN} style={{ marginRight: 3 }} />
                <Text style={styles.densityMedText}>27 Active</Text>
              </View>
            </View>
          </Marker>
        </MapView>

        {/* ── Overlay: Safe Walk Timer ── */}
        <View style={styles.walkTimerOverlay}>
          <MaterialCommunityIcons name="walk" size={20} color={CYAN} style={{ marginBottom: 2 }} />
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
            <Feather name="more-vertical" size={18} color={TEXT} />
          </TouchableOpacity>
          {discreteMenuOpen && (
            <View style={styles.discreteMenu}>
              <TouchableOpacity style={styles.discreteItem} onPress={handleFakeCall}>
                <Feather name="phone" size={14} color={CYAN} />
                <Text style={styles.discreteItemText}>Fake Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.discreteItem} onPress={handleShareLocation}>
                <Ionicons name="location-outline" size={14} color={CYAN} />
                <Text style={styles.discreteItemText}>Share Loc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.discreteItem} onPress={() => setDiscreteMenuOpen(false)}>
                <Ionicons name="notifications-off-outline" size={14} color={CYAN} />
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
          <MaterialCommunityIcons
            name="timer-outline"
            size={24}
            color={dmsEnabled ? CYAN : MUTED}
            style={styles.featureIconEl}
          />
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
          <MaterialCommunityIcons
            name="human-handsdown"
            size={24}
            color={fallEnabled ? CYAN : MUTED}
            style={styles.featureIconEl}
          />
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

      {/* ── Location Sharing Modal ── */}
      <Modal
        visible={isSharingLocation}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent
        onRequestClose={() => setIsSharingLocation(false)}
      >
        <View style={styles.locModalContainer}>
          {/* Header */}
          <View style={styles.locModalHeader}>
            <Animated.View style={[styles.locPulseDot, { transform: [{ scale: pulse }] }]} />
            <Ionicons name="location-sharp" size={16} color={GREEN} style={{ marginRight: 5 }} />
            <Text style={styles.locHeaderText}>Broadcasting Live Location...</Text>
          </View>

          <ScrollView style={styles.locScrollArea} showsVerticalScrollIndicator={false}>
            {/* Section 1: Official Security */}
            <Text style={styles.locSectionTitle}>OFFICIAL SECURITY</Text>
            <View style={styles.locSection}>
              <View style={styles.locContactRow}>
                <View style={styles.locContactInfo}>
                  <Ionicons name="shield-checkmark" size={18} color={CYAN} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.locContactName}>KNUST Campus Security</Text>
                    <Text style={styles.locContactPhone}>Campus Emergency Line</Text>
                  </View>
                </View>
                <Feather name="lock" size={14} color={MUTED} />
              </View>
              <View style={styles.locDivider} />
              <View style={styles.locContactRow}>
                <View style={styles.locContactInfo}>
                  <Ionicons name="shield-checkmark" size={18} color={CYAN} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.locContactName}>Ghana Police Service</Text>
                    <Text style={styles.locContactPhone}>National Emergency — 191</Text>
                  </View>
                </View>
                <Feather name="lock" size={14} color={MUTED} />
              </View>
            </View>

            {/* Section 2: Personal Contacts */}
            <Text style={styles.locSectionTitle}>PERSONAL CONTACTS</Text>
            <View style={styles.locSection}>
              {personalContacts.map((contact, idx) => (
                <React.Fragment key={contact.id}>
                  {idx > 0 && <View style={styles.locDivider} />}
                  <View style={styles.locContactRow}>
                    <View style={styles.locContactInfo}>
                      <View style={styles.locPersonAvatar}>
                        <Ionicons name="person" size={16} color={MUTED} />
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.locContactName}>{contact.name}</Text>
                        <Text style={styles.locContactPhone}>{contact.phone}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeContact(contact.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel={`Remove ${contact.name}`}
                    >
                      <Ionicons name="close-circle" size={22} color={RED} />
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              ))}
              {personalContacts.length === 0 && (
                <Text style={styles.locEmptyText}>No personal contacts added</Text>
              )}
            </View>

            {/* Add Contact */}
            <TouchableOpacity
              style={styles.locAddBtn}
              onPress={() => Alert.alert('Add Contact', 'Opens phone contact book')}
              accessibilityLabel="Add emergency contact"
            >
              <Ionicons name="add-circle-outline" size={20} color={CYAN} />
              <Text style={styles.locAddBtnText}>Add Emergency Contact</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer: Stop Sharing */}
          <TouchableOpacity
            style={styles.locStopBtn}
            onPress={() => setIsSharingLocation(false)}
            activeOpacity={0.8}
            accessibilityLabel="Stop sharing location"
          >
            <Ionicons name="stop-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.locStopBtnText}>STOP SHARING</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Fake Call Modal ── */}
      <Modal
        visible={fakeCallVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={dismissFakeCall}
      >
        <View style={styles.fakeCallContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />

          {/* Caller info */}
          <View style={styles.fakeCallTop}>
            <View style={styles.fakeCallAvatar}>
              <Ionicons name="person" size={52} color="#8E8E93" />
            </View>
            <Text style={styles.fakeCallName}>Mom</Text>
            <Text style={styles.fakeCallLabel}>mobile</Text>
          </View>

          {/* Accept / Decline buttons */}
          <View style={styles.fakeCallActions}>
            <TouchableOpacity
              style={styles.fakeCallBtnWrap}
              onPress={dismissFakeCall}
              accessibilityLabel="Decline call"
            >
              <View style={[styles.fakeCallBtn, styles.fakeCallDecline]}>
                <MaterialCommunityIcons name="phone-hangup" size={32} color="#fff" />
              </View>
              <Text style={styles.fakeCallBtnLabel}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fakeCallBtnWrap}
              onPress={dismissFakeCall}
              accessibilityLabel="Accept call"
            >
              <View style={[styles.fakeCallBtn, styles.fakeCallAccept]}>
                <Ionicons name="call" size={32} color="#fff" />
              </View>
              <Text style={styles.fakeCallBtnLabel}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const CYAN    = '#00E5FF';
const GREEN   = '#00FF88';
const RED     = '#FF4C4C';
const ORANGE  = '#FF7B2F';
const PURPLE  = '#7B2FFF';
const BG      = '#000000';
const CARD    = '#121212';
const BORDER  = 'rgba(255,255,255,0.07)';
const TEXT    = '#F0F4FF';
const MUTED   = '#6B7FA3';

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: BG },
  content:     { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 56, paddingBottom: 40 },

  // Heartbeat bar
  heartbeatBar:     { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(0,255,136,0.04)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.10)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 18 },
  heartbeatItem:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heartbeatDot:     { width: 6, height: 6, borderRadius: 3 },
  heartbeatDotGreen:{ backgroundColor: GREEN, shadowColor: GREEN, shadowOpacity: 0.9, shadowRadius: 3 },
  heartbeatLabel:   { fontSize: 9, fontWeight: '700', color: 'rgba(0,255,136,0.75)', letterSpacing: 0.8 },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandRow:    { flexDirection: 'row', alignItems: 'center' },
  brand:       { fontSize: 22, fontWeight: '800', color: TEXT, letterSpacing: 0.5 },
  tagline:     { fontSize: 12, color: MUTED, marginTop: 2 },
  liveChip:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,255,136,0.08)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.22)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN, shadowColor: GREEN, shadowOpacity: 0.8, shadowRadius: 4 },
  liveText:    { fontSize: 10, fontWeight: '700', color: GREEN, letterSpacing: 1 },

  // Status banner
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16 },
  bannerActive: { backgroundColor: 'rgba(0,229,255,0.06)', borderColor: 'rgba(0,229,255,0.18)' },
  bannerOff:    { backgroundColor: 'rgba(255,76,76,0.07)', borderColor: 'rgba(255,76,76,0.2)' },
  statusTitle:  { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 2 },
  statusSub:    { fontSize: 11, color: MUTED },
  toggleBtn:    { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  toggleOn:     { backgroundColor: 'rgba(0,229,255,0.12)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.32)' },
  toggleOff:    { backgroundColor: 'rgba(255,76,76,0.15)', borderWidth: 1, borderColor: 'rgba(255,76,76,0.35)' },
  toggleText:   { fontSize: 11, fontWeight: '700', color: TEXT },

  // Card
  card:         { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 16, marginBottom: 16 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardLabel:    { fontSize: 11, color: MUTED, fontWeight: '600', letterSpacing: 0.5 },
  zoneName:     { fontSize: 20, fontWeight: '800', color: CYAN, marginBottom: 4 },
  zoneCoord:    { fontSize: 12, color: MUTED },

  // ── Map area ──
  mapContainer:    { position: 'relative', marginBottom: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,229,255,0.10)' },
  mapView:         { height: 260, borderRadius: 16 },

  // ── Crowd-density pins ──
  densityPin:       { alignItems: 'center' },
  densityPinName:   { fontSize: 9, fontWeight: '700', color: 'rgba(240,244,255,0.7)', letterSpacing: 0.4, marginBottom: 3 },
  densityBadge:     { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1 },
  densityHigh:      { backgroundColor: 'rgba(0,255,136,0.10)', borderColor: 'rgba(0,255,136,0.28)' },
  densityHighText:  { fontSize: 9, fontWeight: '700', color: GREEN },
  densityMed:       { backgroundColor: 'rgba(0,229,255,0.10)', borderColor: 'rgba(0,229,255,0.28)' },
  densityMedText:   { fontSize: 9, fontWeight: '700', color: CYAN },
  densityLow:       { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)' },
  densityLowText:   { fontSize: 9, fontWeight: '700', color: MUTED },

  // ── Safe-walk timer overlay ──
  walkTimerOverlay: { position: 'absolute', bottom: 14, left: 12, backgroundColor: 'rgba(0,0,0,0.88)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.16)', borderRadius: 14, padding: 10, alignItems: 'center', minWidth: 80 },
  walkTimerTitle:   { fontSize: 9, fontWeight: '700', color: MUTED, letterSpacing: 0.6, marginBottom: 4 },
  walkTimerClock:   { fontSize: 18, fontWeight: '800', color: CYAN, fontVariant: ['tabular-nums'], marginBottom: 6 },
  walkTimerBtn:     { backgroundColor: 'rgba(0,229,255,0.12)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.32)', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  walkTimerBtnStop: { backgroundColor: 'rgba(255,76,76,0.15)', borderColor: 'rgba(255,76,76,0.35)' },
  walkTimerBtnText: { fontSize: 10, fontWeight: '700', color: TEXT },

  // ── Discrete actions overlay ──
  discreteOverlay:      { position: 'absolute', bottom: 14, right: 12, alignItems: 'flex-end' },
  discreteTrigger:      { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.88)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', justifyContent: 'center', alignItems: 'center' },
  discreteMenu:         { marginBottom: 8, backgroundColor: 'rgba(10,10,10,0.96)', borderWidth: 1, borderColor: 'rgba(0,229,255,0.14)', borderRadius: 12, paddingVertical: 6, minWidth: 120 },
  discreteItem:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9 },
  discreteItemText:     { fontSize: 11, fontWeight: '600', color: TEXT },

  // Feature row
  row:          { flexDirection: 'row', gap: 12, marginBottom: 20 },
  featureCard:  { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 14, alignItems: 'flex-start' },
  featureCardOn:{ borderColor: 'rgba(0,229,255,0.20)', backgroundColor: 'rgba(0,229,255,0.03)' },
  featureIconEl:{ marginBottom: 8 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 4, lineHeight: 18 },
  featureSub:   { fontSize: 11, color: MUTED, marginBottom: 12 },
  smallToggle:  { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },

  // SOS Button
  sosBtn:       { backgroundColor: RED, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 24, shadowColor: RED, shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  sosBtnText:   { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  sosBtnSub:    { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Footer
  footer:       { textAlign: 'center', fontSize: 11, color: MUTED, lineHeight: 18 },

  // ── Fake Call modal ──
  fakeCallContainer: { flex: 1, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'android' ? 80 : 100, paddingBottom: Platform.OS === 'android' ? 60 : 80 },
  fakeCallTop:       { alignItems: 'center' },
  fakeCallAvatar:    { width: 110, height: 110, borderRadius: 55, backgroundColor: '#3A3A3C', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  fakeCallName:      { fontSize: 36, fontWeight: '300', color: '#FFFFFF', letterSpacing: 0.4, marginBottom: 6 },
  fakeCallLabel:     { fontSize: 16, fontWeight: '400', color: '#8E8E93' },
  fakeCallActions:   { flexDirection: 'row', justifyContent: 'center', gap: 72 },
  fakeCallBtnWrap:   { alignItems: 'center' },
  fakeCallBtn:       { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  fakeCallDecline:   { backgroundColor: '#FF3B30' },
  fakeCallAccept:    { backgroundColor: '#34C759' },
  fakeCallBtnLabel:  { fontSize: 13, fontWeight: '500', color: '#FFFFFF' },

  // ── Location Sharing modal ──
  locModalContainer: { flex: 1, backgroundColor: '#121212', paddingTop: Platform.OS === 'android' ? 24 : 16 },
  locModalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, backgroundColor: 'rgba(0,255,136,0.06)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,255,136,0.12)' },
  locPulseDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN, marginRight: 8, shadowColor: GREEN, shadowOpacity: 0.9, shadowRadius: 4 },
  locHeaderText:     { fontSize: 14, fontWeight: '700', color: GREEN, letterSpacing: 0.4 },
  locScrollArea:     { flex: 1, padding: 20 },
  locSectionTitle:   { fontSize: 10, fontWeight: '800', color: MUTED, letterSpacing: 1.2, marginBottom: 10, marginTop: 8 },
  locSection:        { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 4, marginBottom: 20 },
  locContactRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 12 },
  locContactInfo:    { flexDirection: 'row', alignItems: 'center', flex: 1 },
  locPersonAvatar:   { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  locContactName:    { fontSize: 14, fontWeight: '600', color: '#F0F4FF' },
  locContactPhone:   { fontSize: 11, color: MUTED, marginTop: 1 },
  locDivider:        { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 12 },
  locEmptyText:      { fontSize: 12, color: MUTED, textAlign: 'center', paddingVertical: 16 },
  locAddBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(0,229,255,0.18)', borderRadius: 12, borderStyle: 'dashed', marginBottom: 20 },
  locAddBtnText:     { fontSize: 13, fontWeight: '600', color: CYAN, marginLeft: 8 },
  locStopBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: RED, marginHorizontal: 20, marginBottom: Platform.OS === 'android' ? 24 : 40, borderRadius: 14, paddingVertical: 16, shadowColor: RED, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  locStopBtnText:    { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
