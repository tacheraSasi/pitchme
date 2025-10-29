import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

interface NoteDetectorButtonProps {
  bottomSheetRef: React.RefObject<any>;
}

export default function NoteDetectorButton({ bottomSheetRef }: NoteDetectorButtonProps) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  return (
    <ThemedView style={styles.recordingSection}>
        <Pressable
          style={styles.openModalButton}
          onPress={() => bottomSheetRef.current?.expand()}
        >
          <Entypo name="plus" size={28} color="white" />
          <ThemedText style={styles.openModalButtonText}>
            Sing or Hum a Note
          </ThemedText>
          <ThemedText style={styles.openModalSubtext}>
            I tell you which note you sang
          </ThemedText>
        </Pressable>
      </ThemedView>
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
    openModalButton: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
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
