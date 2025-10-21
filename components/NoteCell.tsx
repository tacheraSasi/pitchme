import { ThemedView } from "@/components/themed-view";
import { Note } from "@/constants/notes";

export interface NoteCellProps {
  note: Note;
}
export const NoteCell = ({ note }: NoteCellProps) => {
  return <ThemedView>note</ThemedView>;
};
