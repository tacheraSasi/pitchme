import { getNote, Note, noteAssets } from "@/constants/notes";

export function getNotePath(note: Note) {
  const foundNote = getNote(note);
  if (!foundNote) return null;
  return noteAssets[foundNote];
}