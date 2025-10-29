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

export const noteAssets: Record<Note, any> = {
  [Note.C]: require("../assets/notes/C.m4a"),
  [Note.CSharp]: require("../assets/notes/CSharp.m4a"),
  [Note.D]: require("../assets/notes/D.m4a"),
  [Note.DSharp]: require("../assets/notes/DSharp.m4a"),
  [Note.E]: require("../assets/notes/E.m4a"),
  [Note.F]: require("../assets/notes/F.m4a"),
  [Note.FSharp]: require("../assets/notes/FSharp.m4a"),
  [Note.G]: require("../assets/notes/G.m4a"),
  [Note.GSharp]: require("../assets/notes/GSharp.m4a"),
  [Note.A]: require("../assets/notes/A.m4a"),
  [Note.ASharp]: require("../assets/notes/ASharp.m4a"),
  [Note.B]: require("../assets/notes/B.m4a"),
};
