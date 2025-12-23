import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "system" | "light" | "dark";
export type RecordingQuality = "low" | "medium" | "high";
export type VoicePreset = "tach" | "jonah" | "eliada";

interface SettingsState {
  // Theme settings
  themeMode: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;

  // Audio settings
  loopNotes: boolean;
  setLoopNotes: (enabled: boolean) => void;
  recordingQuality: RecordingQuality;
  setRecordingQuality: (quality: RecordingQuality) => void;
  voicePreset: VoicePreset;
  setVoicePreset: (preset: VoicePreset) => void;

  // Interface settings
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (enabled: boolean) => void;

  // Utility functions
  resetSettings: () => void;
  cycleTheme: () => void;
  cycleRecordingQuality: () => void;
}

const defaultSettings = {
  themeMode: "system" as ThemeMode,
  loopNotes: false,
  recordingQuality: "high" as RecordingQuality,
  voicePreset: "tach" as VoicePreset,
  notifications: false,
  hapticFeedback: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      // Theme actions
      setThemeMode: (themeMode) => set({ themeMode }),
      cycleTheme: () => {
        const themes: ThemeMode[] = ["system", "light", "dark"];
        const currentIndex = themes.indexOf(get().themeMode);
        const nextIndex = (currentIndex + 1) % themes.length;
        set({ themeMode: themes[nextIndex] });
      },

      // Audio actions
      setLoopNotes: (loopNotes) => set({ loopNotes: loopNotes }),
      setRecordingQuality: (recordingQuality) => set({ recordingQuality }),
      cycleRecordingQuality: () => {
        const qualities: RecordingQuality[] = ["low", "medium", "high"];
        const currentIndex = qualities.indexOf(get().recordingQuality);
        const nextIndex = (currentIndex + 1) % qualities.length;
        set({ recordingQuality: qualities[nextIndex] });
      },
      setVoicePreset: (voicePreset) => set({ voicePreset }),

      // Interface actions
      setNotifications: (notifications) => set({ notifications }),
      setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),

      // Utility actions
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "pitchme-settings",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // migrate function for future versions
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

export const useThemeMode = () => useSettingsStore((state) => state.themeMode);
export const useAutoPlay = () => useSettingsStore((state) => state.loopNotes);
export const useRecordingQuality = () =>
  useSettingsStore((state) => state.recordingQuality);
export const useNotifications = () =>
  useSettingsStore((state) => state.notifications);
export const useHapticFeedback = () =>
  useSettingsStore((state) => state.hapticFeedback);

// NOTE: We export individual action selectors to avoid object recreation
export const useSetThemeMode = () =>
  useSettingsStore((state) => state.setThemeMode);
export const useCycleTheme = () =>
  useSettingsStore((state) => state.cycleTheme);

export const useSetLoopNotes = () =>
  useSettingsStore((state) => state.setLoopNotes);
export const useSetRecordingQuality = () =>
  useSettingsStore((state) => state.setRecordingQuality);
export const useCycleRecordingQuality = () =>
  useSettingsStore((state) => state.cycleRecordingQuality);

export const useSetNotifications = () =>
  useSettingsStore((state) => state.setNotifications);
export const useSetHapticFeedback = () =>
  useSettingsStore((state) => state.setHapticFeedback);

export const useVoicePreset = () =>
  useSettingsStore((state) => state.voicePreset);
export const useSetVoicePreset = () =>
  useSettingsStore((state) => state.setVoicePreset);

export const useResetSettings = () =>
  useSettingsStore((state) => state.resetSettings);
