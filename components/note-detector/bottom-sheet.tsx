import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

interface NoteDetectorBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

const NoteDetectorBottomSheet = ({ bottomSheetRef }: NoteDetectorBottomSheetProps) => {
  const colorScheme = useColorScheme();
  const [isRecordingNote, setIsRecordingNote] = useState(false);
  const [isRecordingIdea, setIsRecordingIdea] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const styles = getStyles(colorScheme ?? "light");

  // variables
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleRecordNote = () => {
    if (isRecordingNote) {
      setIsRecordingNote(false);
      setRecordingProgress(0);
      Alert.alert("Recording Stopped", "Your custom note has been saved!");
    } else {
      setIsRecordingNote(true);
      Alert.alert("Recording Started", "Recording your custom note...");
      // Simulate recording progress
      const interval = setInterval(() => {
        setRecordingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const handleRecordIdea = () => {
    if (isRecordingIdea) {
      setIsRecordingIdea(false);
      setRecordingProgress(0);
      Alert.alert("Recording Stopped", "Your music idea has been saved!");
    } else {
      setIsRecordingIdea(true);
      Alert.alert("Recording Started", "Recording your music idea...");
      // Simulate recording progress
      const interval = setInterval(() => {
        setRecordingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const closeModal = () => {
    bottomSheetRef.current?.close();
  };

  // renders
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Start Recording
          </ThemedText>
          <Pressable onPress={closeModal} style={styles.closeButton}>
            <Entypo
              name="cross"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </Pressable>
        </ThemedView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    bottomSheetBackground: {
      backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#ffffff",
    },
    handleIndicator: {
      backgroundColor: colorScheme === "dark" ? "#444444" : "#cccccc",
    },
    contentContainer: {
      flex: 1,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
    },
    closeButton: {
      padding: 4,
    },
    recordingSection: {
      marginBottom: 32,
    },
    sectionDescription: {
      fontSize: 16,
      opacity: 0.7,
      textAlign: "center",
      marginBottom: 24,
      color: Colors[colorScheme].text,
    },
    recordingButtons: {
      gap: 16,
      marginBottom: 20,
    },
    recordButton: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderRadius: 16,
      gap: 8,
    },
    noteButton: {
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
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    buttonSubtext: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: 12,
      textAlign: "center",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      gap: 12,
    },
    recordingIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#FF4444",
    },
    recordingText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#FF4444",
    },
    progressContainer: {
      paddingHorizontal: 20,
      marginTop: 8,
    },
    progressBar: {
      height: 4,
      backgroundColor: colorScheme === "dark" ? "#333333" : "#e0e0e0",
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#FF4444",
      borderRadius: 2,
    },
    tipsSection: {
      marginTop: "auto",
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#333333" : "#e0e0e0",
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      color: Colors[colorScheme].text,
    },
    tipsText: {
      fontSize: 14,
      opacity: 0.7,
      lineHeight: 20,
      color: Colors[colorScheme].text,
    },
  });

export default NoteDetectorBottomSheet;
