
import { HapticFeedbackType, HapticFeedback } from "@/utils/haptics";
import { useCallback } from "react";

/**
 * Hook that provides haptic feedback functions that respect user settings
 */
export function useHaptics() {
  const hapticsEnabled = true; //FIXME: I will Add logic to get this from settings

  const trigger = useCallback(
    async (type: HapticFeedbackType = "light") => {
      if (hapticsEnabled) {
        await HapticFeedback(type);
      }
    },
    [hapticsEnabled]
  );

  const light = useCallback(() => trigger("light"), [trigger]);
  const medium = useCallback(() => trigger("medium"), [trigger]);
  const heavy = useCallback(() => trigger("heavy"), [trigger]);
  const success = useCallback(() => trigger("success"), [trigger]);
  const warning = useCallback(() => trigger("warning"), [trigger]);
  const error = useCallback(() => trigger("error"), [trigger]);
  const selection = useCallback(() => trigger("selection"), [trigger]);

  return {
    trigger,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    isEnabled: hapticsEnabled,
  };
}
