import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotesList } from "@/components/NotesList";

export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">PitchMe</ThemedText>
        </ThemedView>
        <NotesList/>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    margin: 10,
    alignItems: "center",
    gap: 8,
  },
});
