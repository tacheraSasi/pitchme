import { getNote, getNoteAssets, Note } from "@/constants/notes";
import { useVoicePreset } from "@/stores/settingsStore";

export function getNotePath(note: Note, voicePreset?: string) {
  const foundNote = getNote(note);
  if (!foundNote) return null;
  const preset = (voicePreset as any) || "tach";
  const assets = getNoteAssets(preset);
  return assets[foundNote];
}

// Hook version that uses the store
export function useNotePath(note: Note) {
  const voicePreset = useVoicePreset();
  const foundNote = getNote(note);
  if (!foundNote) return null;
  const assets = getNoteAssets(voicePreset);
  return assets[foundNote];
}