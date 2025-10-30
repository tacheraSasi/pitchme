import NoteDetectorBottomSheet from "@/components/note-detector/bottom-sheet";
import NoteDetectorButton from "@/components/note-detector/button";
import { NotesList } from "@/components/NotesList";
import ScreenLayout from "@/components/ScreenLayout";
import TabsHeader from "@/components/tabs-header";
import { ThemedView } from "@/components/themed/themed-view";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const aboutBottomSheetRef = useRef<BottomSheet>(null);
  return (
    <ScreenLayout
      styles={styles.container}
      aboutBottomSheetRef={aboutBottomSheetRef}
    >
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <TabsHeader
            title="PitchMe"
            aboutBottomSheetRef={aboutBottomSheetRef}
          />
          <NoteDetectorButton bottomSheetRef={bottomSheetRef} />
          <NotesList />
        </SafeAreaView>
      </ThemedView>
      <NoteDetectorBottomSheet bottomSheetRef={bottomSheetRef} />
    </ScreenLayout>
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
