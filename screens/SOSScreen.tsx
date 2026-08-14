import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type SOSScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SOS'>;
interface Props { navigation: SOSScreenNavigationProp; }

export default function SOSScreen({ navigation }: Props) {
  const [countdown, setCountdown] = useState(5);
  const [sent, setSent] = useState(false);
  const ringScale  = useRef(new Animated.Value(1)).current;
  const ringOpac   = useRef(new Animated.Value(0.6)).current;

  // Pulsing ring animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 1.6, duration: 900, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 1.0, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpac, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpac, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Auto-send countdown
  useEffect(() => {
    if (sent) return;
    if (countdown === 0) {
      setSent(true);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, sent]);

  const cancel = () => {
    Alert.alert('SOS Cancelled', 'Alert has been cancelled. Stay safe.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0000" />

      <Text style={styles.title}>🚨 SOS ALERT</Text>
      <Text style={styles.subtitle}>
        {sent ? 'Alert sent to Security & Emergency Contacts' : `Sending in ${countdown} seconds…`}
      </Text>

      {/* Pulsing circle */}
      <View style={styles.sosRingWrap}>
        <Animated.View style={[styles.sosRingOuter, { transform: [{ scale: ringScale }], opacity: ringOpac }]} />
        <View style={styles.sosCircle}>
          <Text style={styles.sosEmoji}>{sent ? '✅' : '🆘'}</Text>
          <Text style={styles.sosCircleText}>{sent ? 'SENT' : 'SOS'}</Text>
        </View>
      </View>

      {/* Status details */}
      <View style={styles.infoCard}>
        <InfoRow icon="📍" label="Location" value="KNUST Campus · GPS Active" />
        <InfoRow icon="🔔" label="Contacts" value="Security · Emergency · Guardian" />
        <InfoRow icon="⏱️" label="DMS"      value="Triggered — 3 min timeout" />
        <InfoRow icon="🤸" label="Sensor"   value="Impact detected" />
      </View>

      {!sent && (
        <TouchableOpacity style={styles.cancelBtn} onPress={cancel} accessibilityLabel="Cancel SOS">
          <Text style={styles.cancelText}>✕  CANCEL ALERT</Text>
        </TouchableOpacity>
      )}

      {sent && (
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneText}>Back to Dashboard</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const RED   = '#FF4C4C';
const BG    = '#0E0000';
const CARD  = '#1A0A0A';
const TEXT  = '#F0F4FF';
const MUTED = '#8892A4';

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: Platform.OS === 'android' ? 40 : 60 },
  title:        { fontSize: 28, fontWeight: '900', color: RED, letterSpacing: 1, marginBottom: 8 },
  subtitle:     { fontSize: 14, color: MUTED, marginBottom: 40, textAlign: 'center' },

  sosRingWrap:  { alignItems: 'center', justifyContent: 'center', marginBottom: 40, width: 180, height: 180 },
  sosRingOuter: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: RED },
  sosCircle:    { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,76,76,0.15)', borderWidth: 2, borderColor: RED, alignItems: 'center', justifyContent: 'center' },
  sosEmoji:     { fontSize: 36, marginBottom: 4 },
  sosCircleText:{ fontSize: 18, fontWeight: '900', color: RED, letterSpacing: 2 },

  infoCard:     { width: '100%', backgroundColor: CARD, borderRadius: 16, padding: 16, gap: 12, marginBottom: 32 },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon:     { fontSize: 20, width: 28 },
  infoLabel:    { fontSize: 11, color: MUTED, fontWeight: '600' },
  infoValue:    { fontSize: 13, color: TEXT, fontWeight: '500' },

  cancelBtn:    { backgroundColor: 'rgba(255,76,76,0.12)', borderWidth: 1, borderColor: 'rgba(255,76,76,0.35)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 },
  cancelText:   { fontSize: 14, fontWeight: '700', color: RED, letterSpacing: 0.5 },
  doneBtn:      { backgroundColor: 'rgba(0,255,136,0.12)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.3)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 },
  doneText:     { fontSize: 14, fontWeight: '700', color: '#00FF88' },
});
