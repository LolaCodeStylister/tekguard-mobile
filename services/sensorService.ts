/**
 * sensorService.ts
 * ────────────────
 * Wraps expo-sensors (Accelerometer) for:
 *   1. Fall detection  — sudden spike in acceleration magnitude
 *   2. Dead Man's Switch — inactivity monitor based on lack of significant motion
 *
 * Both features use the device accelerometer. The thresholds below are
 * conservative starting points and should be tuned with real-world testing.
 */

import { Accelerometer } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/Pedometer';

// ── Constants ──────────────────────────────────────────────────────────────

/** g-force magnitude above which a fall event is fired. ~2.5g is a hard impact. */
const FALL_THRESHOLD = 2.5;

/** g-force magnitude below which the user is considered stationary. */
const STILLNESS_THRESHOLD = 0.08;

/** Consecutive "still" samples needed before triggering the DMS inactivity warning. */
const STILL_SAMPLE_LIMIT = 60; // ~60 × 100ms = 6 seconds of no motion

// ── Internal state ─────────────────────────────────────────────────────────
let stillSampleCount = 0;
let lastMagnitude    = 0;

// ── Public API ─────────────────────────────────────────────────────────────

export interface SensorCallbacks {
  onFallDetected?:      () => void;
  onInactivityWarning?: () => void;
  onUpdate?:            (magnitude: number) => void;
}

/**
 * startSensorMonitoring — subscribes to accelerometer at 100 ms intervals.
 * Returns the Subscription so the caller can unsubscribe on unmount.
 */
export function startSensorMonitoring(callbacks: SensorCallbacks): Subscription {
  Accelerometer.setUpdateInterval(100);

  return Accelerometer.addListener(({ x, y, z }) => {
    // Net acceleration magnitude (subtract 1g gravity component)
    const raw = Math.sqrt(x * x + y * y + z * z);
    const mag = Math.abs(raw - 1); // gravity-normalised delta

    lastMagnitude = mag;
    callbacks.onUpdate?.(mag);

    // ── Fall detection ──────────────────────────────────────────────────
    if (raw >= FALL_THRESHOLD) {
      callbacks.onFallDetected?.();
      stillSampleCount = 0; // reset inactivity counter after a fall event
      return;
    }

    // ── DMS inactivity detection ────────────────────────────────────────
    if (mag <= STILLNESS_THRESHOLD) {
      stillSampleCount++;
      if (stillSampleCount >= STILL_SAMPLE_LIMIT) {
        callbacks.onInactivityWarning?.();
        stillSampleCount = 0; // reset after firing so it doesn't spam
      }
    } else {
      stillSampleCount = 0; // motion detected — reset counter
    }
  });
}

/** Returns the last recorded acceleration magnitude. Useful for polling. */
export function getLastMagnitude(): number {
  return lastMagnitude;
}

/** Reset the inactivity sample counter (e.g., after the user taps the DMS button). */
export function resetInactivityCounter(): void {
  stillSampleCount = 0;
}
