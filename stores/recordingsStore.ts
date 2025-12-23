import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface RecordingItem {
  id: string;
  title: string;
  uri: string;
  durationMillis: number;
  date: string; // ISO string
  isFavorite?: boolean; // Optional to maintain backward compatibility
}

interface RecordingsState {
  recordings: RecordingItem[];
  addRecording: (
    r: Omit<RecordingItem, "id" | "date"> & { title?: string }
  ) => Promise<void>;
  updateRecordingTitle: (id: string, title: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
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
          isFavorite: false,
        };
        set((s) => ({ recordings: [item, ...s.recordings] }));
      },
      updateRecordingTitle: async (id, title) => {
        set((s) => ({
          recordings: s.recordings.map((r) =>
            r.id === id ? { ...r, title } : r
          ),
        }));
      },
      toggleFavorite: async (id) => {
        set((s) => ({
          recordings: s.recordings.map((r) =>
            r.id === id ? { ...r, isFavorite: !(r.isFavorite ?? false) } : r
          ),
        }));
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
export const useToggleFavorite = () => useRecordingsStore((s) => s.toggleFavorite);
export const useFavoriteRecordings = () =>
  useRecordingsStore((s) => s.recordings.filter((r) => r.isFavorite ?? false));

export default useRecordingsStore;
