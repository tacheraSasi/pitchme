import RecordModal from "@/components/record-modal";
import ScreenLayout from "@/components/ScreenLayout";
import TabsHeader from "@/components/tabs-header";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RecordingItem, useRecordingsList } from "@/stores/recordingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import BottomSheet from "@gorhom/bottom-sheet";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useRef } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecordScreen() {
  const colorScheme = useColorScheme();
  const recordings = useRecordingsList();
  const styles = getStyles(colorScheme ?? "light");
  const aboutBottomSheetRef = useRef<BottomSheet>(null);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const recordDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - recordDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return recordDate.toLocaleDateString();
  };

  const renderRecordedIdea = ({ item }: { item: RecordingItem }) => {
    // Create audio player for this recording
    const audioPlayer = useAudioPlayer({ uri: item.uri });
    const playerStatus = useAudioPlayerStatus(audioPlayer);

    const togglePlayback = () => {
      if (playerStatus.playing) {
        audioPlayer.pause();
      } else {
        // If we're at the end, restart
        if (playerStatus.currentTime >= playerStatus.duration) {
          audioPlayer.seekTo(0);
        }
        audioPlayer.play();
      }
    };

    return (
      <Pressable style={styles.ideaItem}>
        <View style={styles.ideaIconContainer}>
          <Entypo name="sound-mix" size={20} color={styles.ideaIcon.color} />
        </View>
        <View style={styles.ideaContent}>
          <ThemedText style={styles.ideaTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={styles.ideaMetadata}>
            <ThemedText style={styles.ideaDuration}>
              {formatTime(item.durationMillis)}
            </ThemedText>
            <ThemedText style={styles.ideaDate}>
              {formatDate(item.date)}
            </ThemedText>
          </View>
        </View>
        <Pressable style={styles.playButton} onPress={togglePlayback}>
          <Entypo
            name={playerStatus.playing ? "controller-paus" : "controller-play"}
            size={16}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </Pressable>
      </Pressable>
    );
  };

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
              Your Recordings ({RECORDED_IDEAS.length})
            </ThemedText>
            <FlatList
              data={RECORDED_IDEAS}
              renderItem={renderRecordedIdea}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              style={{ flex: 1 }}
            />
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
  });
