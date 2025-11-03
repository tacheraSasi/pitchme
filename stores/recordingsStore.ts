import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface RecordingItem {
  id: string;
  title: string;
  uri: string;
  durationMillis: number;
  date: string; // ISO string
}

interface RecordingsState {
  recordings: RecordingItem[];
  addRecording: (
    r: Omit<RecordingItem, "id" | "date"> & { title?: string }
  ) => Promise<void>;
  removeRecording: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useRecordingsStore = create<RecordingsState>()(
  persist(
    (set, get) => ({
      recordings: [],
      addRecording: async (r) => {
        const id = `${Date.now()}`;
        const date = new Date().toISOString();
        const item: RecordingItem = {
          id,
          title: r.title ?? `Recording ${new Date().toLocaleString()}`,
          uri: r.uri,
          durationMillis: r.durationMillis ?? 0,
          date,
        };
        set((s) => ({ recordings: [item, ...s.recordings] }));
      },
      removeRecording: async (id) => {
        set((s) => ({ recordings: s.recordings.filter((r) => r.id !== id) }));
      },
      clearAll: async () => {
        set({ recordings: [] });
      },
    }),
    {
      name: "pitchme-recordings",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

export const useRecordingsList = () => useRecordingsStore((s) => s.recordings);

export default useRecordingsStore;
