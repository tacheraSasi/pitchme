import { NoteCell } from "@/components/NoteCell";
import { ThemedView } from "@/components/themed-view"
import { NOTES } from "@/constants/notes";
import { FlatList } from "react-native";

export const NotesList = () => {
    return (
      <ThemedView>
        <FlatList
          renderItem={({ item }) => {
            return <NoteCell note={item} />;
          }}
          data={NOTES}
        />
        ;
      </ThemedView>
    );
}

