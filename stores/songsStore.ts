import { Note } from "@/constants/notes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SongRecording {
  id: string;
  title: string;
  uri: string;
  durationMillis: number;
  date: string; // ISO string
  version: number; // Version/take number
}

export interface ChordProgression {
  id: string;
  name: string; // e.g., "Verse", "Chorus", "Bridge"
  chords: string[]; // e.g., ["C", "Am", "F", "G"]
  bars: number; // Number of bars for this progression
}

export interface Song {
  id: string;
  title: string;
  key: Note;
  bpm: number;
  timeSignature: string; // e.g., "4/4", "3/4", "6/8"
  description: string;
  inspiration: string;
  genre?: string;
  chordProgressions: ChordProgression[];
  recordings: SongRecording[];
  dateCreated: string; // ISO string
  dateModified: string; // ISO string
  tags: string[];
  isCompleted: boolean;
  lyrics?: string;
  isFavorite: boolean;
}

interface SongsState {
  songs: Song[];
  currentSong: Song | null;

  // Song CRUD operations
  createSong: (
    song: Omit<Song, "id" | "dateCreated" | "dateModified" | "recordings">
  ) => Promise<Song>;
  updateSong: (
    id: string,
    updates: Partial<Omit<Song, "id" | "dateCreated">>
  ) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getSong: (id: string) => Song | undefined;
  setCurrentSong: (song: Song | null) => void;

  // Chord progression operations
  addChordProgression: (
    songId: string,
    progression: Omit<ChordProgression, "id">
  ) => Promise<void>;
  updateChordProgression: (
    songId: string,
    progressionId: string,
    updates: Partial<Omit<ChordProgression, "id">>
  ) => Promise<void>;
  deleteChordProgression: (
    songId: string,
    progressionId: string
  ) => Promise<void>;

  // Recording operations for songs
  addRecordingToSong: (
    songId: string,
    recording: Omit<SongRecording, "id" | "date" | "version">
  ) => Promise<void>;
  updateSongRecording: (
    songId: string,
    recordingId: string,
    updates: Partial<Omit<SongRecording, "id">>
  ) => Promise<void>;
  deleteSongRecording: (songId: string, recordingId: string) => Promise<void>;

  // Utility functions
  getSongsByKey: (key: Note) => Song[];
  getSongsByGenre: (genre: string) => Song[];
  searchSongs: (query: string) => Song[];
  duplicateSong: (id: string) => Promise<Song | null>;
  clearAllSongs: () => Promise<void>;
}

const generateId = () =>
  `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSongsStore = create<SongsState>()(
  persist(
    (set, get) => ({
      songs: [],
      currentSong: null,

      createSong: async (songData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newSong: Song = {
          ...songData,
          id,
          recordings: [],
          dateCreated: now,
          dateModified: now,
          isFavorite: false,
        };

        set((state) => ({
          songs: [newSong, ...state.songs],
        }));

        return newSong;
      },

      updateSong: async (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          songs: state.songs.map((song) =>
            song.id === id ? { ...song, ...updates, dateModified: now } : song
          ),
          currentSong:
            state.currentSong?.id === id
              ? { ...state.currentSong, ...updates, dateModified: now }
              : state.currentSong,
        }));
      },

      deleteSong: async (id) => {
        set((state) => ({
          songs: state.songs.filter((song) => song.id !== id),
          currentSong: state.currentSong?.id === id ? null : state.currentSong,
        }));
      },

      toggleFavorite: async (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          songs: state.songs.map((song) =>
            song.id === id
              ? { ...song, isFavorite: !song.isFavorite, dateModified: now }
              : song
          ),
          currentSong:
            state.currentSong?.id === id
              ? {
                  ...state.currentSong,
                  isFavorite: !state.currentSong.isFavorite,
                  dateModified: now,
                }
              : state.currentSong,
        }));
      },

      getSong: (id) => {
        return get().songs.find((song) => song.id === id);
      },

      setCurrentSong: (song) => {
        set({ currentSong: song });
      },

      addChordProgression: async (songId, progression) => {
        const progressionId = `progression_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 6)}`;
        const newProgression: ChordProgression = {
          ...progression,
          id: progressionId,
        };

        await get().updateSong(songId, {
          chordProgressions: [
            ...(get().getSong(songId)?.chordProgressions || []),
            newProgression,
          ],
        });
      },

      updateChordProgression: async (songId, progressionId, updates) => {
        const song = get().getSong(songId);
        if (!song) return;

        const updatedProgressions = song.chordProgressions.map((prog) =>
          prog.id === progressionId ? { ...prog, ...updates } : prog
        );

        await get().updateSong(songId, {
          chordProgressions: updatedProgressions,
        });
      },

      deleteChordProgression: async (songId, progressionId) => {
        const song = get().getSong(songId);
        if (!song) return;

        const updatedProgressions = song.chordProgressions.filter(
          (prog) => prog.id !== progressionId
        );

        await get().updateSong(songId, {
          chordProgressions: updatedProgressions,
        });
      },

      addRecordingToSong: async (songId, recording) => {
        const song = get().getSong(songId);
        if (!song) return;

        const recordingId = `recording_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 6)}`;
        const version = song.recordings.length + 1;
        const now = new Date().toISOString();

        const newRecording: SongRecording = {
          ...recording,
          id: recordingId,
          date: now,
          version,
        };

        await get().updateSong(songId, {
          recordings: [...song.recordings, newRecording],
        });
      },

      updateSongRecording: async (songId, recordingId, updates) => {
        const song = get().getSong(songId);
        if (!song) return;

        const updatedRecordings = song.recordings.map((rec) =>
          rec.id === recordingId ? { ...rec, ...updates } : rec
        );

        await get().updateSong(songId, { recordings: updatedRecordings });
      },

      deleteSongRecording: async (songId, recordingId) => {
        const song = get().getSong(songId);
        if (!song) return;

        const updatedRecordings = song.recordings.filter(
          (rec) => rec.id !== recordingId
        );

        await get().updateSong(songId, { recordings: updatedRecordings });
      },

      getSongsByKey: (key) => {
        return get().songs.filter((song) => song.key === key);
      },

      getSongsByGenre: (genre) => {
        return get().songs.filter((song) => song.genre === genre);
      },

      searchSongs: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().songs.filter(
          (song) =>
            song.title.toLowerCase().includes(lowercaseQuery) ||
            song.description.toLowerCase().includes(lowercaseQuery) ||
            song.inspiration.toLowerCase().includes(lowercaseQuery) ||
            song.tags.some((tag) =>
              tag.toLowerCase().includes(lowercaseQuery)
            ) ||
            song.genre?.toLowerCase().includes(lowercaseQuery)
        );
      },

      duplicateSong: async (id) => {
        const song = get().getSong(id);
        if (!song) return null;

        const {
          id: _,
          dateCreated,
          dateModified,
          recordings,
          ...songData
        } = song;
        const duplicatedSong = await get().createSong({
          ...songData,
          title: `${song.title} (Copy)`,
        });

        return duplicatedSong;
      },

      clearAllSongs: async () => {
        set({ songs: [], currentSong: null });
      },
    }),
    {
      name: "pitchme-songs",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

// Selectors for easy access
export const useSongsList = () => useSongsStore((state) => state.songs);
export const useCurrentSong = () => useSongsStore((state) => state.currentSong);
export const useCreateSong = () => useSongsStore((state) => state.createSong);
export const useUpdateSong = () => useSongsStore((state) => state.updateSong);
export const useDeleteSong = () => useSongsStore((state) => state.deleteSong);
export const useToggleFavorite = () => useSongsStore((state) => state.toggleFavorite);
export const useGetSong = () => useSongsStore((state) => state.getSong);
export const useSetCurrentSong = () =>
  useSongsStore((state) => state.setCurrentSong);

export default useSongsStore;
