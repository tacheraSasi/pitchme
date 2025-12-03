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

const tachAssets: Record<Note, any> = {
  [Note.C]: require("../assets/notes/tach/C.m4a"),
  [Note.CSharp]: require("../assets/notes/tach/CSharp.m4a"),
  [Note.D]: require("../assets/notes/tach/D.m4a"),
  [Note.DSharp]: require("../assets/notes/tach/DSharp.m4a"),
  [Note.E]: require("../assets/notes/tach/E.m4a"),
  [Note.F]: require("../assets/notes/tach/F.m4a"),
  [Note.FSharp]: require("../assets/notes/tach/FSharp.m4a"),
  [Note.G]: require("../assets/notes/tach/G.m4a"),
  [Note.GSharp]: require("../assets/notes/tach/GSharp.m4a"),
  [Note.A]: require("../assets/notes/tach/A.m4a"),
  [Note.ASharp]: require("../assets/notes/tach/ASharp.m4a"),
  [Note.B]: require("../assets/notes/tach/B.m4a"),
};

const jonahAssets: Record<Note, any> = {
  [Note.C]: require("../assets/notes/jonah/C.m4a"),
  [Note.CSharp]: require("../assets/notes/jonah/CSharp.m4a"),
  [Note.D]: require("../assets/notes/jonah/D.m4a"),
  [Note.DSharp]: require("../assets/notes/jonah/DSharp.m4a"),
  [Note.E]: require("../assets/notes/jonah/E.m4a"),
  [Note.F]: require("../assets/notes/jonah/F.m4a"),
  [Note.FSharp]: require("../assets/notes/jonah/FSharp.m4a"),
  [Note.G]: require("../assets/notes/jonah/G.m4a"),
  [Note.GSharp]: require("../assets/notes/jonah/GSharp.m4a"),
  [Note.A]: require("../assets/notes/jonah/A.m4a"),
  [Note.ASharp]: require("../assets/notes/jonah/ASharp.m4a"),
  [Note.B]: require("../assets/notes/jonah/B.m4a"),
};

const eliadaAssets: Record<Note, any> = {
  [Note.C]: require("../assets/notes/eliada/C.m4a"),
  [Note.CSharp]: require("../assets/notes/eliada/CSharp.m4a"),
  [Note.D]: require("../assets/notes/eliada/D.m4a"),
  [Note.DSharp]: require("../assets/notes/eliada/DSharp.m4a"),
  [Note.E]: require("../assets/notes/eliada/E.m4a"),
  [Note.F]: require("../assets/notes/eliada/F.m4a"),
  [Note.FSharp]: require("../assets/notes/eliada/FSharp.m4a"),
  [Note.G]: require("../assets/notes/eliada/G.m4a"),
  [Note.GSharp]: require("../assets/notes/eliada/GSharp.m4a"),
  [Note.A]: require("../assets/notes/eliada/A.m4a"),
  [Note.ASharp]: require("../assets/notes/eliada/ASharp.m4a"),
  [Note.B]: require("../assets/notes/eliada/B.m4a"),
};

// Mapping of presets to their assets
const presetAssetsMap: Record<VoicePreset, Record<Note, any>> = {
  tach: tachAssets,
  jonah: jonahAssets,
  eliada: eliadaAssets,
};

export const getNoteAssets = (preset: VoicePreset): Record<Note, any> => {
  return presetAssetsMap[preset];
};

// Default preset (for backward compatibility)
export const noteAssets: Record<Note, any> = getNoteAssets("tach");
