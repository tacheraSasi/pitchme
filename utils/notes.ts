import { getNote, Note } from "@/constants/notes";

export function getNotePath(note: Note) {
    const foundNote = getNote(note);
    if (!foundNote) return null;
    const audioSource = require(`../assets/notes/${foundNote}.m4a`);
    return audioSource;
}