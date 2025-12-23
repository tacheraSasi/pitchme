import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGlobalAudioPlayer } from "@/hooks/use-global-audio-player";
import { RecordingItem, useRecordingsStore } from "@/stores/recordingsStore";
import { exportAudio } from "@/utils/exporter";
import { formatDate, formatTime } from "@/utils/lib";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import {
  PanGestureHandler,
} from "react-native-gesture-handler";
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
  const [isLooping, setIsLooping] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const seekBarRef = useRef<View>(null);
  const [seekBarWidth, setSeekBarWidth] = useState(0);
  const initialSeekProgress = useRef(0);
  const [fileInfo, setFileInfo] = useState<{
    size: number;
    exists: boolean;
  } | null>(null);

  const { updateRecordingTitle, removeRecording, toggleFavorite } = useRecordingsStore();
  const { player, playExclusive, pause } = useGlobalAudioPlayer(
    recording?.uri || ""
  );
  const playerStatus = useAudioPlayerStatus(player);

  // Update loop state on player
  useEffect(() => {
    if (player) {
      player.loop = isLooping;
    }
  }, [player, isLooping]);

  // Update current time display
  const currentTime = isSeeking ? seekPosition : playerStatus.currentTime;
  const duration = playerStatus.duration || (recording?.durationMillis ? recording.durationMillis / 1000 : 0) || 0;
  const progress = duration > 0 ? currentTime / duration : 0;

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

  const handleExportRecording = async () => {
    if (!recording) return;

    try {
      toast.success("Starting audio share...", { duration: 2000 });

      const outputPath = await exportAudio(recording.uri, true);

      if (outputPath) {
        toast.success(`Audio shared successfully! Saved to gallery.`);
        console.log("Audio shared from:", outputPath.uri);
      }
    } catch (error) {
      console.error("Error sharing recording:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to share recording: ${errorMessage}`);
    }
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

  const handleSeekBarLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setSeekBarWidth(width);
  };

  const handleSeekPress = (event: any) => {
    if (!seekBarWidth || !recording) return;
    
    const { locationX } = event.nativeEvent;
    const newPosition = Math.max(0, Math.min(1, locationX / seekBarWidth));
    const seekTime = newPosition * duration;
    
    setSeekPosition(seekTime);
    player.seekTo(seekTime);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onSeekGestureEvent = useCallback((event: any) => {
    if (!seekBarWidth || !recording) return;
    
    const { translationX, x } = event.nativeEvent;
    // Use x if available (relative to view), otherwise use translationX
    const locationX = x !== undefined ? x : (initialSeekProgress.current * seekBarWidth + translationX);
    const newProgress = Math.max(0, Math.min(1, locationX / seekBarWidth));
    const seekTime = newProgress * duration;
    
    setSeekPosition(seekTime);
  }, [seekBarWidth, recording, duration]);

  const onSeekHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === 2) {
      // ACTIVE - dragging started
      setIsSeeking(true);
      initialSeekProgress.current = progress;
      setSeekPosition(playerStatus.currentTime);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (event.nativeEvent.state === 5) {
      // END - dragging ended
      setIsSeeking(false);
      player.seekTo(seekPosition);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [progress, playerStatus.currentTime, seekPosition, player]);

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            <ThemedView style={styles.titleActions}>
              <Pressable
                onPress={() => {
                  if (recording) {
                    toggleFavorite(recording.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
                style={styles.favoriteButton}
              >
                <Entypo
                  name={recording.isFavorite ? "star" : "star-outlined"}
                  size={22}
                  color={
                    recording.isFavorite
                      ? Colors[colorScheme ?? "light"].tint
                      : Colors[colorScheme ?? "light"].text
                  }
                />
              </Pressable>
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
          
          {/* Seekable Progress Bar */}
          <View style={styles.seekBarContainer}>
            <View
              ref={seekBarRef}
              onLayout={handleSeekBarLayout}
              style={styles.seekBarBackground}
            >
              {/* Progress Fill */}
              <ThemedView
                style={[
                  styles.seekBarProgress,
                  { width: `${progress * 100}%` },
                ]}
              />
              
              {/* Play Button */}
              <Pressable
                style={[styles.playButtonContainer, { left: `${progress * 100}%` }]}
                onPress={togglePlayback}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ThemedView style={styles.playButton}>
                  <Entypo
                    name={
                      playerStatus.playing
                        ? "controller-paus"
                        : "controller-play"
                    }
                    size={20}
                    color={colorScheme === "dark" ? "black" : "white"}
                  />
                </ThemedView>
              </Pressable>
              
              {/* Seekable Area */}
              <PanGestureHandler
                onGestureEvent={onSeekGestureEvent}
                onHandlerStateChange={onSeekHandlerStateChange}
                activeOffsetX={[-10, 10]}
              >
                <View style={styles.seekableArea}>
                  <Pressable
                    style={styles.seekablePressArea}
                    onPress={handleSeekPress}
                  />
                </View>
              </PanGestureHandler>
            </View>
          </View>

          {/* Time Display and Controls */}
          <ThemedView style={styles.playbackControls}>
            <ThemedText style={styles.timeText}>
              {formatTime(Math.floor(currentTime * 1000))}
            </ThemedText>
            
            <ThemedView style={styles.controlButtons}>
              <Pressable
                style={[
                  styles.controlButton,
                  isLooping && styles.controlButtonActive,
                ]}
                onPress={toggleLoop}
              >
                <MaterialIcons
                  name="repeat"
                  size={20}
                  color={
                    isLooping
                      ? Colors[colorScheme ?? "light"].tint
                      : Colors[colorScheme ?? "light"].text
                  }
                />
              </Pressable>
            </ThemedView>
            
            <ThemedText style={styles.timeText}>
              {formatTime(recording.durationMillis)}
            </ThemedText>
          </ThemedView>
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
            onPress={handleExportRecording}
          >
            <Entypo
              name="music"
              size={20}
              color={Colors[colorScheme ?? "light"].background}
            />
            <ThemedText style={styles.exportButtonText}>
              Share Recording
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
    titleActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    favoriteButton: {
      padding: 6,
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
    seekBarContainer: {
      marginBottom: 12,
    },
    seekBarBackground: {
      height: 60,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
      borderRadius: 12,
      position: "relative",
      overflow: "visible",
    },
    seekableArea: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 12,
    },
    seekablePressArea: {
      flex: 1,
    },
    seekBarProgress: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: Colors[colorScheme].tint + "40",
      borderRadius: 12,
    },
    playButtonContainer: {
      position: "absolute",
      top: "50%",
      transform: [{ translateX: -20 }, { translateY: -20 }],
      zIndex: 10,
    },
    playButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme].tint,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    playbackControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 4,
    },
    timeText: {
      fontSize: 12,
      color: Colors[colorScheme].text,
      opacity: 0.7,
      fontWeight: "500",
      minWidth: 50,
    },
    controlButtons: {
      flexDirection: "row",
      gap: 8,
    },
    controlButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#e8e8e8",
    },
    controlButtonActive: {
      backgroundColor: Colors[colorScheme].tint + "20",
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
