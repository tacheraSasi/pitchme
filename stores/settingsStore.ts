import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "system" | "light" | "dark";
export type RecordingQuality = "low" | "medium" | "high";

interface SettingsState {
  // Theme settings
  themeMode: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;

  // Audio settings
  autoPlay: boolean;
  setAutoPlay: (enabled: boolean) => void;
  recordingQuality: RecordingQuality;
  setRecordingQuality: (quality: RecordingQuality) => void;

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
  autoPlay: false,
  recordingQuality: "high" as RecordingQuality,
  notifications: true,
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
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setRecordingQuality: (recordingQuality) => set({ recordingQuality }),
      cycleRecordingQuality: () => {
        const qualities: RecordingQuality[] = ["low", "medium", "high"];
        const currentIndex = qualities.indexOf(get().recordingQuality);
        const nextIndex = (currentIndex + 1) % qualities.length;
        set({ recordingQuality: qualities[nextIndex] });
      },

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
export const useAutoPlay = () => useSettingsStore((state) => state.autoPlay);
export const useRecordingQuality = () =>
  useSettingsStore((state) => state.recordingQuality);
export const useNotifications = () =>
  useSettingsStore((state) => state.notifications);
export const useHapticFeedback = () =>
  useSettingsStore((state) => state.hapticFeedback);

export const useThemeActions = () =>
  useSettingsStore((state) => ({
    setThemeMode: state.setThemeMode,
    cycleTheme: state.cycleTheme,
  }));

export const useAudioActions = () =>
  useSettingsStore((state) => ({
    setAutoPlay: state.setAutoPlay,
    setRecordingQuality: state.setRecordingQuality,
    cycleRecordingQuality: state.cycleRecordingQuality,
  }));

export const useInterfaceActions = () =>
  useSettingsStore((state) => ({
    setNotifications: state.setNotifications,
    setHapticFeedback: state.setHapticFeedback,
  }));
