import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback } from "react";
import { StyleSheet } from "react-native";

interface AboutBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

const AboutBottomSheet = ({ bottomSheetRef }: AboutBottomSheetProps) => {
  const colorScheme = useColorScheme();

  const styles = getStyles(colorScheme ?? "light");
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["40%"]}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={BottomSheetBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleSection}>
            <ThemedView style={styles.titleIconContainer}>
              <Entypo
                name="info"
                size={24}
                color={Colors[colorScheme ?? "light"].tint}
              />
            </ThemedView>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              About PitchMe
            </ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Record, tag & share ideas
            </ThemedText>
            <ThemedText style={styles.desc}>
              PitchMe is your personal musical idea companion. Capture
              inspiration whenever it strikes with seamless audio recording,
              organize your creative thoughts with tags, and never lose a melody
              again.
            </ThemedText>
            <ThemedText style={styles.desc}>
              \Tachera Sasi\
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    bottomSheetBackground: {
      backgroundColor: Colors[colorScheme].background,
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
      alignItems: "flex-start",
      marginBottom: 32,
    },
    titleSection: {
      flex: 1,
      alignItems: "center",
    },
    titleIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(107, 89, 195, 0.2)"
          : "rgba(150, 89, 151, 0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      opacity: 0.7,
      textAlign: "center",
    },
    desc: {
      fontSize: 12,
      color: Colors[colorScheme].text,
      fontStyle:"italic",
      opacity: 0.7,
      marginTop:6,
      textAlign: "center",
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

export default AboutBottomSheet;
