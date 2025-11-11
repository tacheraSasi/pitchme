import { useCallback, useRef, useState } from "react";

/**
 * Hook for calculating BPM from tap tempo
 */
export function useTapTempo() {
  const [bpm, setBpm] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const tapTimes = useRef<number[]>([]);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tap = useCallback(() => {
    const now = Date.now();

    // Clear any existing reset timeout
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    // Add current tap time
    tapTimes.current.push(now);
    setTapCount((prev) => prev + 1);

    // Keep only the last 8 taps for more accurate BPM calculation
    if (tapTimes.current.length > 8) {
      tapTimes.current.shift();
    }

    // Need at least 2 taps to calculate BPM
    if (tapTimes.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i] - tapTimes.current[i - 1]);
      }

      // Calculate average interval
      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;

      // Convert to BPM (60000 ms = 1 minute)
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Clamp BPM to reasonable range
      const clampedBpm = Math.max(40, Math.min(200, calculatedBpm));
      setBpm(clampedBpm);
    }

    // Reset after 3 seconds of no tapping
    resetTimeoutRef.current = setTimeout(() => {
      tapTimes.current = [];
      setTapCount(0);
      setBpm(null);
    }, 3000);
  }, []);

  const reset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    tapTimes.current = [];
    setTapCount(0);
    setBpm(null);
  }, []);

  return {
    bpm,
    tapCount,
    tap,
    reset,
  };
}
