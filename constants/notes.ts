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

export function getNote(note:Note){
    return NOTES.find(
        (n)=>n.toLowerCase() === note.toLowerCase()
    )
}
