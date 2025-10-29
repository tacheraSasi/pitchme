import { getNote, Note } from "@/constants/notes";

export function getNotePath(note: Note) {
    const foundNote = getNote(note);
    if (!foundNote) return null;

    return `../assets/notes/${foundNote}.m4a`;
}