import NoteDetectorBottomSheet from "@/components/note-detector/bottom-sheet";
import NoteDetectorButton from "@/components/note-detector/button";
import { NotesList } from "@/components/NotesList";
import TabsHeader from "@/components/tabs-header";
import { ThemedView } from "@/components/themed-view";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {

  const bottomSheetRef = useRef<BottomSheet>(null);
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <TabsHeader title="PitchMe"/>
          <NoteDetectorButton bottomSheetRef={bottomSheetRef} />
          <NotesList />
        </SafeAreaView>
      </ThemedView>
      <NoteDetectorBottomSheet bottomSheetRef={bottomSheetRef} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "grey",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    alignItems: "center",
  },
});
