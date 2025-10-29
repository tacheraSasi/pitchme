import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import BottomSheet from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

interface RecordedIdea {
  id: string;
  title: string;
  duration: string;
  date: string;
  type: "note" | "idea";
}

// Dummy data for recorded ideas
const RECORDED_IDEAS: RecordedIdea[] = [
  {
    id: "1",
    title: "Melody for chorus",
    duration: "0:45",
    date: "Today",
    type: "idea",
  },
  {
    id: "2",
    title: "Custom C# note",
    duration: "0:12",
    date: "Yesterday",
    type: "note",
  },
  {
    id: "3",
    title: "Jazz progression idea",
    duration: "1:23",
    date: "2 days ago",
    type: "idea",
  },
  {
    id: "4",
    title: "Vocal harmony concept",
    duration: "0:38",
    date: "3 days ago",
    type: "idea",
  },
  {
    id: "5",
    title: "Bass line experiment",
    duration: "0:56",
    date: "1 week ago",
    type: "idea",
  },
  {
    id: "6",
    title: "Custom F major note",
    duration: "0:08",
    date: "1 week ago",
    type: "note",
  },
];

export default function RecordScreen() {
  const colorScheme = useColorScheme();
  const [isRecordingNote, setIsRecordingNote] = useState(false);
  const [isRecordingIdea, setIsRecordingIdea] = useState(false);

  const styles = getStyles(colorScheme ?? "light");
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleRecordNote = () => {
    if (isRecordingNote) {
      setIsRecordingNote(false);
      Alert.alert("Recording Stopped", "Your custom note has been saved!");
    } else {
      setIsRecordingNote(true);
      Alert.alert("Recording Started", "Recording your custom note...");
    }
  };

  const handleRecordIdea = () => {
    if (isRecordingIdea) {
      setIsRecordingIdea(false);
      Alert.alert("Recording Stopped", "Your music idea has been saved!");
    } else {
      setIsRecordingIdea(true);
      Alert.alert("Recording Started", "Recording your music idea...");
    }
  };

  const renderRecordedIdea = ({ item }: { item: RecordedIdea }) => (
    <Pressable style={styles.ideaItem}>
      <View style={styles.ideaIconContainer}>
        <Entypo
          name={item.type === "note" ? "music" : "sound-mix"}
          size={20}
          color={styles.ideaIcon.color}
        />
      </View>
      <View style={styles.ideaContent}>
        <ThemedText style={styles.ideaTitle}>{item.title}</ThemedText>
        <View style={styles.ideaMetadata}>
          <ThemedText style={styles.ideaDuration}>{item.duration}</ThemedText>
          <ThemedText style={styles.ideaDate}>{item.date}</ThemedText>
        </View>
      </View>
      <Pressable style={styles.playButton}>
        <Entypo
          name="controller-play"
          size={16}
          color={Colors[colorScheme ?? "light"].tint}
        />
      </Pressable>
    </Pressable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Record Studio</ThemedText>
          </ThemedView>

          <ThemedView style={styles.recordingSection}>
            <View style={styles.recordingButtons}>
              <Pressable
                style={[
                  styles.recordButton,
                  isRecordingNote && styles.recordingButton,
                ]}
                onPress={handleRecordNote}
              >
                <Entypo
                  name={isRecordingNote ? "controller-stop" : "mic"}
                  size={24}
                  color="white"
                />
                <ThemedText style={styles.buttonText}>
                  {isRecordingNote ? "Stop" : "Note"}
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.recordButton,
                  styles.ideaButton,
                  isRecordingIdea && styles.recordingButton,
                ]}
                onPress={handleRecordIdea}
              >
                <Entypo
                  name={isRecordingIdea ? "controller-stop" : "sound-mix"}
                  size={24}
                  color="white"
                />
                <ThemedText style={styles.buttonText}>
                  {isRecordingIdea ? "Stop" : "Idea"}
                </ThemedText>
              </Pressable>
            </View>

            {/* Recording Status */}
            {(isRecordingNote || isRecordingIdea) && (
              <View style={styles.statusContainer}>
                <View style={styles.recordingIndicator} />
                <ThemedText style={styles.recordingText}>
                  Recording...
                </ThemedText>
              </View>
            )}
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
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const getStyles = (colorScheme: "light" | "dark" = "light") =>
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
    recordingButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      gap: 16,
      marginBottom: 16,
    },
    recordButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 8,
      backgroundColor:
        colorScheme === "dark" ? "#6B59C3" : Colors[colorScheme].tint,
    },
    ideaButton: {
      backgroundColor: colorScheme === "dark" ? "#E85A4F" : "#FF6B6B",
    },
    recordingButton: {
      backgroundColor: "#FF4444",
    },
    buttonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 8,
    },
    recordingIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#FF4444",
    },
    recordingText: {
      fontSize: 12,
      fontWeight: "500",
      color: "#FF4444",
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
