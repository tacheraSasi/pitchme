import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGlobalAudioPlayer } from "@/hooks/use-global-audioi-player";
import { RecordingItem, useRecordingsStore } from "@/stores/recordingsStore";
import { formatDate, formatTime } from "@/utils/lib";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { alert, toast } from "yooo-native";

interface RecordingDetailsBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  recording: RecordingItem | null;
  onChange?: (index: number) => void;
}

const RecordingDetailsBottomSheet = ({
  bottomSheetRef,
  recording,
  onChange,
}: RecordingDetailsBottomSheetProps) => {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [fileInfo, setFileInfo] = useState<{
    size: number;
    exists: boolean;
  } | null>(null);

  const { updateRecordingTitle, removeRecording } = useRecordingsStore();
  const { player, playExclusive, pause } = useGlobalAudioPlayer(
    recording?.uri || ""
  );
  const playerStatus = useAudioPlayerStatus(player);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("RecordingDetailsBottomSheet handleSheetChanges", index);
      if (index === -1) {
        // Sheet closed, reset editing state
        setIsEditing(false);
        setEditedTitle("");
      }
      // Call parent onChange handler if provided
      if (onChange) {
        onChange(index);
      }
    },
    [onChange]
  );

  const loadFileInfo = useCallback(async () => {
    if (!recording?.uri) {
      setFileInfo(null);
      return;
    }

    try {
      const file = new FileSystem.File(recording.uri);
      const exists = file.exists;
      const info = exists ? await file.info() : null;

      setFileInfo({
        size: info?.size || 0,
        exists,
      });
    } catch (error) {
      console.error("Error loading file info:", error);
      setFileInfo({ size: 0, exists: false });
    }
  }, [recording?.uri]);

  // Update local state when recording changes
  useEffect(() => {
    if (recording) {
      // Only update the edited title if we're not currently editing
      // This prevents overriding the user's input while they're typing
      if (!isEditing) {
        setEditedTitle(recording.title);
      }
      loadFileInfo();
    }
  }, [recording, loadFileInfo, isEditing]);

  const handleSaveTitle = async () => {
    if (!recording || !editedTitle.trim()) {
      return;
    }

    try {
      await updateRecordingTitle(recording.id, editedTitle.trim());
      setIsEditing(false);
      // The editedTitle will be updated automatically when the recording prop updates from the store
      toast.success("Recording title updated!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(recording?.title || "");
    setIsEditing(false);
  };

  const handleDeleteRecording = () => {
    if (!recording) return;

    alert.dialog(
      "Delete Recording",
      `Are you sure you want to delete "${recording.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete the file
              const file = new FileSystem.File(recording.uri);
              if (file.exists) {
                file.delete();
              }

              // Remove from store
              await removeRecording(recording.id);

              // Close the bottom sheet
              bottomSheetRef.current?.close();

              toast.success("Recording deleted");
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            } catch (error) {
              console.error("Error deleting recording:", error);
              toast.error("Failed to delete recording");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const togglePlayback = async () => {
    if (!recording) return;

    try {
      if (playerStatus.playing) {
        await pause();
      } else {
        if (playerStatus.currentTime >= playerStatus.duration) {
          player.seekTo(0);
        }
        await playExclusive();
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      toast.error("Failed to play recording");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  if (!recording) {
    return null;
  }

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
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleSection}>
            <ThemedView style={styles.titleIconContainer}>
              <Entypo
                name="sound-mix"
                size={24}
                color={Colors[colorScheme ?? "light"].tint}
              />
            </ThemedView>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Recording Details
            </ThemedText>
          </ThemedView>
          <Pressable onPress={closeSheet} style={styles.closeButton}>
            <Entypo
              name="cross"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </Pressable>
        </ThemedView>

        {/* Title Section */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Title</ThemedText>
            {!isEditing ? (
              <Pressable
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                <MaterialIcons
                  name="edit"
                  size={18}
                  color={Colors[colorScheme ?? "light"].tint}
                />
              </Pressable>
            ) : (
              <ThemedView style={styles.editActions}>
                <Pressable
                  onPress={handleCancelEdit}
                  style={styles.actionButton}
                >
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={Colors[colorScheme ?? "light"].text}
                  />
                </Pressable>
                <Pressable
                  onPress={handleSaveTitle}
                  style={styles.actionButton}
                >
                  <MaterialIcons
                    name="check"
                    size={18}
                    color={Colors[colorScheme ?? "light"].tint}
                  />
                </Pressable>
              </ThemedView>
            )}
          </ThemedView>

          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Enter recording title"
              placeholderTextColor={Colors[colorScheme ?? "light"].text + "80"}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <ThemedText style={styles.titleText}>{recording.title}</ThemedText>
          )}
        </ThemedView>

        {/* Playback Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Playback</ThemedText>
          <Pressable style={styles.playbackButton} onPress={togglePlayback}>
            <ThemedView style={styles.playbackIcon}>
              <Entypo
                name={
                  playerStatus.playing ? "controller-paus" : "controller-play"
                }
                size={24}
                color={colorScheme === "dark" ? "black" : "white"}
              />
            </ThemedView>
            <ThemedView style={styles.playbackInfo}>
              <ThemedText style={styles.playbackStatus}>
                {playerStatus.playing ? "Playing..." : "Tap to play"}
              </ThemedText>
              <ThemedText style={styles.playbackDuration}>
                {formatTime(recording.durationMillis)}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        {/* Information Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Information</ThemedText>
          <ThemedView style={styles.infoGrid}>
            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Duration</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatTime(recording.durationMillis)}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Date Created</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(recording.date)}
              </ThemedText>
            </ThemedView>
            {fileInfo && (
              <ThemedView style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>File Size</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {formatFileSize(fileInfo.size)}
                </ThemedText>
              </ThemedView>
            )}
            <ThemedView style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Format</ThemedText>
              <ThemedText style={styles.infoValue}>M4A Audio</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Actions Section */}
        <ThemedView style={styles.actionsSection}>
          <Pressable
            style={styles.exportButton}
            // onPress={handleExportRecording}
          >
            <Entypo name="video" size={20} color={Colors[colorScheme ?? "light"].background} />
            <ThemedText style={styles.exportButtonText}>
              Export Recording as Video
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={handleDeleteRecording}
          >
            <Entypo name="trash" size={20} color="white" />
            <ThemedText style={styles.deleteButtonText}>
              Delete Recording
            </ThemedText>
          </Pressable>
        </ThemedView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    bottomSheetBackground: {
      backgroundColor: Colors[colorScheme].bottomSheetBackground,
    },
    handleIndicator: {
      backgroundColor: Colors[colorScheme].handleIndicator,
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
    titleSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    titleIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(150, 89, 151, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors[colorScheme].text,
    },
    closeButton: {
      padding: 8,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    editButton: {
      padding: 6,
    },
    editActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      padding: 6,
    },
    titleInput: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    titleText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    playbackButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
      borderRadius: 12,
      gap: 16,
    },
    playbackIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors[colorScheme].tint,
      alignItems: "center",
      justifyContent: "center",
    },
    playbackInfo: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
    },
    playbackStatus: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    playbackDuration: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.7,
    },
    infoGrid: {
      gap: 12,
    },
    infoItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.7,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    actionsSection: {
      marginTop: "auto",
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].borderColor,
    },
    exportButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].tint,
      borderRadius: 12,
      padding: 16,
      gap: 8,
      marginVertical: 8,
    },
    exportButtonText: {
      color: Colors[colorScheme].background,
      fontSize: 16,
      fontWeight: "600",
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].isRecording,
      borderRadius: 12,
      padding: 16,
      gap: 8,
      marginVertical: 8,
    },
    deleteButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default RecordingDetailsBottomSheet;
