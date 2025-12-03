import { VoicePreset } from "@/stores/settingsStore";

export enum Note {
  C = "C",
  CSharp = "C#",
  D = "D",
  DSharp = "D#",
  E = "E",
  F = "F",
  FSharp = "F#",
  G = "G",
  GSharp = "G#",
  A = "A",
  ASharp = "A#",
  B = "B",
}

export const NOTES: Note[] = Object.values(Note);

export function getNote(note: Note) {
  return NOTES.find((n) => n.toLowerCase() === note.toLowerCase());
}

// Voice preset paths
const getVoicePresetPath = (preset: VoicePreset): string => {
  return `../assets/notes/${preset}/`;
};

export const getNoteAssets = (preset: VoicePreset): Record<Note, any> => {
  const basePath = getVoicePresetPath(preset);
  return {
    [Note.C]: require(basePath + "C.m4a"),
    [Note.CSharp]: require(basePath + "CSharp.m4a"),
    [Note.D]: require(basePath + "D.m4a"),
    [Note.DSharp]: require(basePath + "DSharp.m4a"),
    [Note.E]: require(basePath + "E.m4a"),
    [Note.F]: require(basePath + "F.m4a"),
    [Note.FSharp]: require(basePath + "FSharp.m4a"),
    [Note.G]: require(basePath + "G.m4a"),
    [Note.GSharp]: require(basePath + "GSharp.m4a"),
    [Note.A]: require(basePath + "A.m4a"),
    [Note.ASharp]: require(basePath + "ASharp.m4a"),
    [Note.B]: require(basePath + "B.m4a"),
  };
};

export const noteAssets: Record<Note, any> = getNoteAssets("tach");
