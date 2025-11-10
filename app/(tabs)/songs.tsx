import ScreenLayout from "@/components/ScreenLayout";
import TabsHeader from "@/components/tabs-header";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Song, useDeleteSong, useSongsList } from "@/stores/songsStore";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { alert } from "yooo-native";

interface SongItemProps {
  song: Song;
  onDelete: (id: string) => void;
}

const SongItem = ({ song, onDelete }: SongItemProps) => {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  const handleDelete = () => {
    alert.dialog(
      "Delete Song",
      `Are you sure you want to delete "${song.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(song.id),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = () => {
    if (song.isCompleted) {
      return Colors[colorScheme ?? "light"].tint;
    }
    return Colors[colorScheme ?? "light"].icon;
  };

  return (
    <Pressable
      style={styles.songItem}
      onPress={() => router.push(`/songs/view/${song.id}`)}
      android_ripple={{ color: Colors[colorScheme ?? "light"].tint + "20" }}
    >
      <View style={styles.songItemContent}>
        <View style={styles.songHeader}>
          <View style={styles.songTitleContainer}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.songTitle}
              numberOfLines={1}
            >
              {song.title}
            </ThemedText>
            <View
              style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
            />
          </View>
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons
              name="trash-outline"
              size={20}
              color={Colors[colorScheme ?? "light"].icon}
            />
          </Pressable>
        </View>

        <View style={styles.songDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="musical-note"
              size={16}
              color={Colors[colorScheme ?? "light"].icon}
            />
            <ThemedText style={styles.detailText}>Key: {song.key}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={Colors[colorScheme ?? "light"].icon}
            />
            <ThemedText style={styles.detailText}>{song.bpm} BPM</ThemedText>
          </View>
          {song.genre && (
            <View style={styles.detailRow}>
              <Ionicons
                name="albums-outline"
                size={16}
                color={Colors[colorScheme ?? "light"].icon}
              />
              <ThemedText style={styles.detailText}>{song.genre}</ThemedText>
            </View>
          )}
        </View>

        {song.description && (
          <ThemedText style={styles.songDescription} numberOfLines={2}>
            {song.description}
          </ThemedText>
        )}

        <View style={styles.songFooter}>
          <ThemedText style={styles.dateText}>
            Created {formatDate(song.dateCreated)}
          </ThemedText>
          <View style={styles.recordingsCount}>
            <Ionicons
              name="mic"
              size={14}
              color={Colors[colorScheme ?? "light"].icon}
            />
            <ThemedText style={styles.countText}>
              {song.recordings.length} recording
              {song.recordings.length !== 1 ? "s" : ""}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default function SongsScreen() {
  const colorScheme = useColorScheme();
  const songs = useSongsList();
  const deleteSong = useDeleteSong();
  const aboutBottomSheetRef = useRef<BottomSheet>(null);
  const styles = getStyles(colorScheme ?? "light");

  const handleDeleteSong = async (id: string) => {
    try {
      await deleteSong(id);
    } catch (error) {
      console.error("Error deleting song:", error);
      alert.dialog("Error", "Failed to delete song. Please try again.");
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="musical-notes-outline"
        size={80}
        color={Colors[colorScheme ?? "light"].icon}
      />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No Songs Yet
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Start creating your musical masterpieces! Tap the + button to create
        your first song.
      </ThemedText>
      <Pressable
        style={styles.createFirstSongButton}
        onPress={() => router.push("/songs/create")}
      >
        <ThemedText style={styles.createFirstSongButtonText}>
          Create Your First Song
        </ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ScreenLayout
      styles={styles.container}
      aboutBottomSheetRef={aboutBottomSheetRef}
    >
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <TabsHeader
            title="Songs"
            aboutBottomSheetRef={aboutBottomSheetRef}
            showSearchButton={true}
            onSearchPress={() => router.push("/songs/search" as any)}
          />

          <ThemedView style={styles.songCreationSection}>
            <Pressable
              style={styles.createSongButton}
              onPress={() => router.push("/songs/create")}
            >
              <ThemedView style={styles.iconContainer}>
                <Ionicons name="add" size={28} color="white" />
              </ThemedView>
              <ThemedText style={styles.createSongButtonText}>
                Create New Song
              </ThemedText>
              <ThemedText style={styles.createSongSubtext}>
                Start composing your next masterpiece
              </ThemedText>
            </Pressable>
          </ThemedView>

          {songs.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={songs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongItem song={item} onDelete={handleDeleteSong} />
              )}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </ThemedView>
    </ScreenLayout>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    songCreationSection: {
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
    createSongButton: {
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
    createSongButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    createSongSubtext: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: 14,
      textAlign: "center",
    },
    songItem: {
      marginBottom: 16,
      borderRadius: 16,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
      overflow: "hidden",
    },
    songItemContent: {
      padding: 16,
    },
    songHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    songTitleContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    songTitle: {
      fontSize: 18,
      flex: 1,
      color: Colors[colorScheme].text,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 8,
    },
    deleteButton: {
      padding: 4,
    },
    songDetails: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
      gap: 12,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    detailText: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
    },
    songDescription: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.8,
      marginBottom: 12,
      lineHeight: 20,
    },
    songFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dateText: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
      opacity: 0.7,
    },
    recordingsCount: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    countText: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyTitle: {
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
      color: Colors[colorScheme].text,
    },
    emptyDescription: {
      textAlign: "center",
      color: Colors[colorScheme].icon,
      lineHeight: 22,
      marginBottom: 24,
    },
    createFirstSongButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    createFirstSongButtonText: {
      color: colorScheme === "dark" ? "#000" : "#fff",
      fontWeight: "600",
    },
  });
