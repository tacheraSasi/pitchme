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
const defaultPath = "../assets/notes/tach/";
export const noteAssets: Record<Note, any> = {
  [Note.C]: require(defaultPath+"/C.m4a"),
  [Note.CSharp]: require(defaultPath+"/CSharp.m4a"),
  [Note.D]: require(defaultPath+"/D.m4a"),
  [Note.DSharp]: require(defaultPath+"/DSharp.m4a"),
  [Note.E]: require(defaultPath+"/E.m4a"),
  [Note.F]: require(defaultPath+"/F.m4a"),
  [Note.FSharp]: require(defaultPath+"/FSharp.m4a"),
  [Note.G]: require(defaultPath+"/G.m4a"),
  [Note.GSharp]: require(defaultPath+"/GSharp.m4a"),
  [Note.A]: require(defaultPath+"/A.m4a"),
  [Note.ASharp]: require(defaultPath+"/ASharp.m4a"),
  [Note.B]: require(defaultPath+"/B.m4a"),
};
