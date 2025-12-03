import ChordProgressionManager from "@/components/chord-progression-manager";
import MetronomeControls from "@/components/metronome-controls";
import SongRecordModal from "@/components/song-record-modal";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { getNoteAssets, Note } from "@/constants/notes";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGlobalAudioPlayer } from "@/hooks/use-global-audio-player";
import { useVoicePreset } from "@/stores/settingsStore";
import {
  SongRecording,
  useAddToRecentlyViewed,
  useSetCurrentSong,
  useSongsStore,
} from "@/stores/songsStore";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { alert } from "yooo-native";

interface RecordingItemProps {
  recording: SongRecording;
  onPlay: () => void;
  onDelete: () => void;
  isPlaying?: boolean;
}

const RecordingItem = ({
  recording,
  onPlay,
  onDelete,
  isPlaying,
}: RecordingItemProps) => {
  const colorScheme = useColorScheme();
  const styles = getRecordingItemStyles(colorScheme ?? "light");

  const { playExclusive, pause } = useGlobalAudioPlayer(recording.uri);

  const formatDuration = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePlay = async () => {
    try {
      if (isPlaying) {
        await pause();
      } else {
        await playExclusive();
      }
      onPlay();
    } catch (error) {
      alert.dialog("Error", "Error playing recording");
      console.error("Error playing recording:", error);
    }
  };

  return (
    <View style={styles.recordingItem}>
      <View style={styles.recordingHeader}>
        <View style={styles.recordingInfo}>
          <ThemedText style={styles.recordingTitle} numberOfLines={1}>
            {recording.title}
          </ThemedText>
          <ThemedText style={styles.recordingMeta}>
            Version {recording.version} •{" "}
            {formatDuration(recording.durationMillis)} •{" "}
            {formatDate(recording.date)}
          </ThemedText>
        </View>
        <View style={styles.recordingActions}>
          <Pressable onPress={handlePlay} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color={Colors[colorScheme ?? "light"].tint}
            />
          </Pressable>
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Ionicons
              name="trash-outline"
              size={18}
              color={Colors[colorScheme ?? "light"].icon}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default function SongScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const setCurrentSong = useSetCurrentSong();
  const addToRecentlyViewed = useAddToRecentlyViewed();
  const { deleteSongRecording } = useSongsStore();
  const styles = getStyles(colorScheme ?? "light");

  // Subscribe directly to the song from the store to get automatic updates
  const song = useSongsStore((state) =>
    state.songs.find((song) => song.id === id)
  );
  const [currentPlayingRecording, setCurrentPlayingRecording] = useState<
    string | null
  >(null);
  const recordModalRef = useRef<BottomSheet>(null);
  const voicePreset = useVoicePreset();

  // Get note assets based on selected voice preset
  const noteAssets = useMemo(() => getNoteAssets(voicePreset), [voicePreset]);
  
  // Get the key note, defaulting to C if not found
  const keyNote = (song?.key as Note) || Note.C;
  const keyPlayer = useGlobalAudioPlayer(noteAssets[keyNote]);

  useEffect(() => {
    if (song) {
      setCurrentSong(song);
      addToRecentlyViewed(song.id);
    }

    return () => {
      setCurrentSong(null);
    };
  }, [song, setCurrentSong, addToRecentlyViewed]);

  const handlePlayKey = useCallback(async () => {
    try {
      await keyPlayer.playExclusive();
    } catch (error) {
      console.error("Error playing key:", error);
      alert.dialog("Error", "Failed to play key note");
    }
  }, [keyPlayer]);

  const handlePlayRecording = useCallback(
    (recordingId: string) => {
      setCurrentPlayingRecording(
        currentPlayingRecording === recordingId ? null : recordingId
      );
    },
    [currentPlayingRecording]
  );

  const handleDeleteRecording = useCallback(
    (recordingId: string) => {
      alert.dialog(
        "Delete Recording",
        "Are you sure you want to delete this recording?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteSongRecording(id!, recordingId);
              } catch (error) {
                console.error("Error deleting recording:", error);
                alert.dialog("Error", "Failed to delete recording");
              }
            },
          },
        ]
      );
    },
    [id, deleteSongRecording]
  );

  const handleAddNewRecording = useCallback(() => {
    recordModalRef.current?.expand();
  }, []);

  if (!song) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </Pressable>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Song Not Found
            </ThemedText>
          </View>

          <View style={styles.errorContainer}>
            <Ionicons
              name="musical-notes-outline"
              size={80}
              color={Colors[colorScheme ?? "light"].icon}
            />
            <ThemedText style={styles.errorText}>
              This song could not be found.
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </Pressable>
          <ThemedText
            type="subtitle"
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {song.title}
          </ThemedText>
          <Pressable
            onPress={() => router.push(`/songs/edit?id=${song.id}`)}
            style={styles.editButton}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color={Colors[colorScheme ?? "light"].tint}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Song Info Card */}
          <View style={styles.songCard}>
            <View style={styles.songHeader}>
              <View style={styles.songTitleRow}>
                <ThemedText type="title" style={styles.songTitle}>
                  {song.title}
                </ThemedText>
                <View
                  style={[
                    styles.statusBadge,
                    song.isCompleted && styles.statusBadgeCompleted,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statusText,
                      song.isCompleted && styles.statusTextCompleted,
                    ]}
                  >
                    {song.isCompleted ? "Completed" : "In Progress"}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.songMeta}>
                <View style={styles.metaRow}>
                  <Ionicons
                    name="musical-note"
                    size={16}
                    color={Colors[colorScheme ?? "light"].icon}
                  />
                  <ThemedText style={styles.metaText}>
                    Key: {song.key}
                  </ThemedText>
                  <Pressable
                    onPress={handlePlayKey}
                    style={styles.playKeyButton}
                  >
                    <Ionicons
                      name="play"
                      size={14}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.playKeyText}>Play Key</ThemedText>
                  </Pressable>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons
                    name="speedometer-outline"
                    size={16}
                    color={Colors[colorScheme ?? "light"].icon}
                  />
                  <ThemedText style={styles.metaText}>
                    {song.bpm} BPM
                  </ThemedText>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={Colors[colorScheme ?? "light"].icon}
                  />
                  <ThemedText style={styles.metaText}>
                    {song.timeSignature}
                  </ThemedText>
                </View>
                {song.genre && (
                  <View style={styles.metaRow}>
                    <Ionicons
                      name="albums-outline"
                      size={16}
                      color={Colors[colorScheme ?? "light"].icon}
                    />
                    <ThemedText style={styles.metaText}>
                      {song.genre}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            {song.description && (
              <View style={styles.descriptionSection}>
                <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                <ThemedText style={styles.descriptionText}>
                  {song.description}
                </ThemedText>
              </View>
            )}

            {song.inspiration && (
              <View style={styles.descriptionSection}>
                <ThemedText style={styles.sectionTitle}>Inspiration</ThemedText>
                <ThemedText style={styles.descriptionText}>
                  {song.inspiration}
                </ThemedText>
              </View>
            )}

            {song.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <ThemedText style={styles.sectionTitle}>Tags</ThemedText>
                <View style={styles.tagsContainer}>
                  {song.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <ThemedText style={styles.tagText}>{tag}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Metronome */}
          <MetronomeControls
            bpm={song.bpm}
            timeSignature={song.timeSignature}
            showBpmControls={false} // Don't allow changing BPM in view mode
          />

          {/* Chord Progressions */}
          <ChordProgressionManager
            songId={song.id}
            progressions={song.chordProgressions}
          />

          {/* Recordings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionHeaderTitle}>
                Recordings ({song.recordings.length})
              </ThemedText>
              <Pressable
                onPress={handleAddNewRecording}
                style={styles.addRecordingButton}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={colorScheme === "dark" ? "#000" : "#fff"}
                />
                <ThemedText style={styles.addRecordingText}>
                  Add Recording
                </ThemedText>
              </Pressable>
            </View>

            {song.recordings.length > 0 ? (
              <FlatList
                data={song.recordings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <RecordingItem
                    recording={item}
                    onPlay={() => handlePlayRecording(item.id)}
                    onDelete={() => handleDeleteRecording(item.id)}
                    isPlaying={currentPlayingRecording === item.id}
                  />
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              />
            ) : (
              <View style={styles.emptyRecordings}>
                <Ionicons
                  name="mic-outline"
                  size={48}
                  color={Colors[colorScheme ?? "light"].icon}
                />
                <ThemedText style={styles.emptyRecordingsText}>
                  No recordings yet. Tap &quot;Add Recording&quot; to capture
                  your musical ideas!
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <SongRecordModal
        bottomSheetRef={recordModalRef}
        songId={song.id}
        songTitle={song.title}
      />
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].borderColor,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginHorizontal: 16,
    },
    editButton: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    songCard: {
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    songHeader: {
      marginBottom: 16,
    },
    songTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    songTitle: {
      flex: 1,
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
      marginRight: 12,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: Colors[colorScheme].icon + "20",
    },
    statusBadgeCompleted: {
      backgroundColor: Colors[colorScheme].tint + "20",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors[colorScheme].icon,
    },
    statusTextCompleted: {
      color: Colors[colorScheme].tint,
    },
    songMeta: {
      gap: 8,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaText: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
    },
    playKeyButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginLeft: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].tint + "20",
    },
    playKeyText: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors[colorScheme].tint,
    },
    descriptionSection: {
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: Colors[colorScheme].text,
    },
    descriptionText: {
      fontSize: 14,
      lineHeight: 20,
      color: Colors[colorScheme].text,
      opacity: 0.8,
    },
    tagsSection: {
      marginTop: 16,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: Colors[colorScheme].tint + "20",
    },
    tagText: {
      fontSize: 12,
      fontWeight: "500",
      color: Colors[colorScheme].tint,
    },
    section: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionHeaderTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    addRecordingButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: Colors[colorScheme].tint,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addRecordingText: {
      fontSize: 14,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000" : "#fff",
    },
    progressionCard: {
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    progressionName: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      color: Colors[colorScheme].text,
    },
    chordsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    chordBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].tint + "20",
    },
    chordText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].tint,
    },
    progressionBars: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
      opacity: 0.7,
    },
    emptyRecordings: {
      alignItems: "center",
      paddingVertical: 32,
    },
    emptyRecordingsText: {
      textAlign: "center",
      color: Colors[colorScheme].icon,
      marginTop: 12,
      lineHeight: 20,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    errorText: {
      textAlign: "center",
      color: Colors[colorScheme].icon,
      marginTop: 16,
      fontSize: 16,
    },
  });

const getRecordingItemStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    recordingItem: {
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    recordingHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    recordingInfo: {
      flex: 1,
      marginRight: 12,
    },
    recordingTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    recordingMeta: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
      opacity: 0.7,
    },
    recordingActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    playButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme].tint + "20",
    },
    deleteButton: {
      padding: 8,
    },
  });
