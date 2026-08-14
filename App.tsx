/**
 * App.tsx — TekGuard Mobile
 * ──────────────────────────
 * Root navigator using React Navigation native-stack.
 * Screens:
 *   Home  →  Main dashboard (system status, DMS toggle, SOS entry point)
 *   SOS   →  Active alert screen with countdown & dispatch
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import SOSScreen  from './screens/SOSScreen';

// ── Route parameter map ────────────────────────────────────────────────────
export type RootStackParamList = {
  Home: undefined;
  SOS:  undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ── Custom header style shared across all screens ─────────────────────────
const SCREEN_OPTIONS = {
  headerStyle:       { backgroundColor: '#060D18' },
  headerTintColor:   '#F0F4FF',
  headerTitleStyle:  { fontWeight: '700' as const, fontSize: 16 },
  headerBackVisible: true,
  animation:         'slide_from_right' as const,
  contentStyle:      { backgroundColor: '#060D18' },
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '⚡ TekGuard', headerShown: false }}
        />
        <Stack.Screen
          name="SOS"
          component={SOSScreen}
          options={{
            title:            '🚨 SOS Alert',
            headerStyle:      { backgroundColor: '#0E0000' },
            headerTintColor:  '#FF4C4C',
            headerTitleStyle: { fontWeight: '900' as const, fontSize: 17 },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
