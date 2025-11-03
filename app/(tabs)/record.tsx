import RecordModal from "@/components/record-modal";
import { RecordingListItem } from "@/components/recording-list-item";
import ScreenLayout from "@/components/ScreenLayout";
import TabsHeader from "@/components/tabs-header";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRecordingsList } from "@/stores/recordingsStore";
import { formatDate, formatTime } from "@/utils/lib";
import Entypo from "@expo/vector-icons/Entypo";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function RecordScreen() {
  const colorScheme = useColorScheme();
  const recordings = useRecordingsList();
  const styles = getStyles(colorScheme ?? "light");
  const aboutBottomSheetRef = useRef<BottomSheet>(null);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);



  return (
    <ScreenLayout
      styles={styles.container}
      aboutBottomSheetRef={aboutBottomSheetRef}
    >
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <TabsHeader
            title="Record Studio"
            aboutBottomSheetRef={aboutBottomSheetRef}
          />

          <ThemedView style={styles.recordingSection}>
            <Pressable
              style={styles.openModalButton}
              onPress={() => bottomSheetRef.current?.expand()}
            >
              <ThemedView style={styles.iconContainer}>
                <Entypo name="plus" size={28} color="white" />
              </ThemedView>
              <ThemedText style={styles.openModalButtonText}>
                Capture the Sound
              </ThemedText>
              <ThemedText style={styles.openModalSubtext}>
                Let your creativity flow into sound
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.listContainer}>
            <ThemedText style={styles.listTitle}>
              Your Recordings ({recordings.length})
            </ThemedText>
            {recordings.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <Entypo
                  name="sound-mix"
                  size={48}
                  color={Colors[colorScheme ?? "light"].icon}
                  style={styles.emptyIcon}
                />
                <ThemedText style={styles.emptyText}>
                  No recordings yet
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Tap &quot;Capture the Sound&quot; to record your first musical
                  idea
                </ThemedText>
              </ThemedView>
            ) : (
              <FlatList
                data={recordings}
                renderItem={({ item }) => (
                  <RecordingListItem
                    recording={item}
                    formatTime={formatTime}
                    formatDate={formatDate}
                    colorScheme={colorScheme ?? "light"}
                    styles={styles}
                  />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                style={{ flex: 1 }}
              />
            )}
          </ThemedView>
        </SafeAreaView>

        <RecordModal bottomSheetRef={bottomSheetRef} />
      </ThemedView>
    </ScreenLayout>
  );
}

export const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "grey",
    },
    titleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 16,
      alignItems: "center",
    },
    recordingSection: {
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    openModalButton: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 16,
      gap: 8,
      backgroundColor:
        colorScheme === "dark" ? "#6B59C3" : Colors[colorScheme].tint,
      marginHorizontal: 20,
    },
    openModalButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    openModalSubtext: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: 14,
      textAlign: "center",
    },

    listContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    listTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      paddingHorizontal: 4,
      color: Colors[colorScheme].text,
    },
    listContent: {
      paddingBottom: 20,
    },
    ideaItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f8f9fa",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#333333" : "#e9ecef",
    },
    ideaIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        colorScheme === "dark" ? "#6B59C3" : Colors[colorScheme].tint,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    ideaIcon: {
      color: "white",
    },
    ideaContent: {
      flex: 1,
      marginRight: 12,
    },
    ideaTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      color: Colors[colorScheme].text,
    },
    ideaMetadata: {
      flexDirection: "row",
      gap: 12,
    },
    ideaDuration: {
      fontSize: 12,
      opacity: 0.7,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    ideaDate: {
      fontSize: 12,
      opacity: 0.6,
      color: Colors[colorScheme].text,
    },
    playButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#444444" : "#e0e0e0",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyIcon: {
      opacity: 0.5,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 8,
      opacity: 0.7,
      color: Colors[colorScheme].text,
    },
    emptySubtext: {
      fontSize: 14,
      opacity: 0.5,
      textAlign: "center",
      color: Colors[colorScheme].text,
    },
  });
