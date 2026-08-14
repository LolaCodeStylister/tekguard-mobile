/**
 * StatusBadge.tsx
 * ───────────────
 * Reusable coloured badge pill. Used across HomeScreen and SOSScreen
 * to display risk levels, system status, and DMS state.
 *
 * Props:
 *   label  — the text to display
 *   color  — one of 'green' | 'red' | 'orange' | 'cyan' | 'muted'
 *   size   — 'sm' | 'md' (default 'md')
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Color = 'green' | 'red' | 'orange' | 'cyan' | 'muted';
type Size  = 'sm' | 'md';

interface Props {
  label: string;
  color?: Color;
  size?:  Size;
}

const PALETTE: Record<Color, { bg: string; border: string; text: string }> = {
  green:  { bg: 'rgba(0,255,136,0.10)',  border: 'rgba(0,255,136,0.30)',  text: '#00FF88' },
  red:    { bg: 'rgba(255,76,76,0.12)',  border: 'rgba(255,76,76,0.35)',  text: '#FF4C4C' },
  orange: { bg: 'rgba(255,123,47,0.12)', border: 'rgba(255,123,47,0.35)', text: '#FF7B2F' },
  cyan:   { bg: 'rgba(0,212,255,0.10)',  border: 'rgba(0,212,255,0.30)',  text: '#00D4FF' },
  muted:  { bg: 'rgba(255,255,255,0.05)',border: 'rgba(255,255,255,0.12)',text: '#6B7FA3' },
};

export default function StatusBadge({ label, color = 'cyan', size = 'md' }: Props) {
  const pal  = PALETTE[color];
  const isLg = size === 'md';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: pal.bg, borderColor: pal.border },
      isLg ? styles.md : styles.sm,
    ]}>
      <Text style={[styles.text, { color: pal.text }, isLg ? styles.textMd : styles.textSm]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge:   { borderWidth: 1, borderRadius: 20, alignSelf: 'flex-start' },
  md:      { paddingHorizontal: 12, paddingVertical: 5 },
  sm:      { paddingHorizontal: 8,  paddingVertical: 3 },
  text:    { fontWeight: '700', letterSpacing: 0.6 },
  textMd:  { fontSize: 12 },
  textSm:  { fontSize: 10 },
});
