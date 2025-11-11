import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import {
  Song,
  useDeleteSong,
  useSongsList,
  useToggleFavorite,
} from "@/stores/songsStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { alert } from "yooo-native";

type SortOption = "dateCreated" | "title" | "bpm" | "completion";
type SortOrder = "asc" | "desc";
type FilterOption = "all" | "completed" | "inProgress" | "favorites";

interface SongItemProps {
  song: Song;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  colorScheme: "light" | "dark";
}

const SongItem = ({
  song,
  onDelete,
  onToggleFavorite,
  colorScheme,
}: SongItemProps) => {
  const styles = getStyles(colorScheme);

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
      return Colors[colorScheme].tint;
    }
    return Colors[colorScheme].icon;
  };

  return (
    <Pressable
      style={styles.songItem}
      onPress={() => router.push(`/songs/view/${song.id}`)}
      android_ripple={{ color: Colors[colorScheme].tint + "20" }}
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
          <View style={styles.songActions}>
            <Pressable
              onPress={() => onToggleFavorite(song.id)}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={song.isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={song.isFavorite ? "#FF6B6B" : Colors[colorScheme].icon}
              />
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={Colors[colorScheme].icon}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.songDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="musical-note"
              size={16}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.detailText}>Key: {song.key}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.detailText}>{song.bpm} BPM</ThemedText>
          </View>
          {song.genre && (
            <View style={styles.detailRow}>
              <Ionicons
                name="albums-outline"
                size={16}
                color={Colors[colorScheme].icon}
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
            <Ionicons name="mic" size={14} color={Colors[colorScheme].icon} />
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

export default function SongsSearchScreen() {
  const colorScheme = useColorScheme();
  const songs = useSongsList();
  const deleteSong = useDeleteSong();
  const toggleFavorite = useToggleFavorite();
  const haptics = useHaptics();
  const styles = getStyles(colorScheme ?? "light");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateCreated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteSong = async (id: string) => {
    try {
      await deleteSong(id);
      haptics.success();
    } catch (error) {
      console.error("Error deleting song:", error);
      haptics.error();
      alert.dialog("Error", "Failed to delete song. Please try again.");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
      haptics.light();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      haptics.error();
      alert.dialog("Error", "Failed to update favorite. Please try again.");
    }
  };

  const filteredAndSortedSongs = useMemo(() => {
    let filtered = songs;

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.description.toLowerCase().includes(query) ||
          song.genre?.toLowerCase().includes(query) ||
          song.key.toLowerCase().includes(query) ||
          song.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter((song) => {
        if (filterBy === "completed") return song.isCompleted;
        if (filterBy === "inProgress") return !song.isCompleted;
        if (filterBy === "favorites") return song.isFavorite;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "dateCreated":
          comparison =
            new Date(a.dateCreated).getTime() -
            new Date(b.dateCreated).getTime();
          break;
        case "bpm":
          comparison = a.bpm - b.bpm;
          break;
        case "completion":
          comparison = Number(a.isCompleted) - Number(b.isCompleted);
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [songs, searchQuery, sortBy, sortOrder, filterBy]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const SortFilterControls = () => (
    <View style={styles.controlsSection}>
      <View style={styles.controlsHeader}>
        <ThemedText style={styles.controlsTitle}>Filter & Sort</ThemedText>
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          style={styles.toggleButton}
        >
          <Ionicons
            name={showFilters ? "chevron-up" : "chevron-down"}
            size={20}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.controlsContent}>
          {/* Sort Controls */}
          <View style={styles.controlGroup}>
            <ThemedText style={styles.controlLabel}>Sort by:</ThemedText>
            <View style={styles.chipRow}>
              {[
                { key: "dateCreated", label: "Date" },
                { key: "title", label: "Title" },
                { key: "bpm", label: "BPM" },
                { key: "completion", label: "Status" },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.chip,
                    sortBy === option.key && styles.chipSelected,
                  ]}
                  onPress={() => setSortBy(option.key as SortOption)}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      sortBy === option.key && styles.chipTextSelected,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Sort Order */}
          <View style={styles.controlGroup}>
            <ThemedText style={styles.controlLabel}>Order:</ThemedText>
            <View style={styles.chipRow}>
              {[
                { key: "asc", label: "Ascending" },
                { key: "desc", label: "Descending" },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.chip,
                    sortOrder === option.key && styles.chipSelected,
                  ]}
                  onPress={() => setSortOrder(option.key as SortOrder)}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      sortOrder === option.key && styles.chipTextSelected,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Filter Controls */}
          <View style={styles.controlGroup}>
            <ThemedText style={styles.controlLabel}>Filter by:</ThemedText>
            <View style={styles.chipRow}>
              {[
                { key: "all", label: "All Songs" },
                { key: "completed", label: "Completed" },
                { key: "inProgress", label: "In Progress" },
                { key: "favorites", label: "Favorites" },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.chip,
                    filterBy === option.key && styles.chipSelected,
                  ]}
                  onPress={() => setFilterBy(option.key as FilterOption)}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      filterBy === option.key && styles.chipTextSelected,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="search-outline"
        size={64}
        color={Colors[colorScheme ?? "light"].icon}
        style={styles.emptyIcon}
      />
      <ThemedText style={styles.emptyTitle}>
        {searchQuery.trim() ? "No songs found" : "Start searching"}
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        {searchQuery.trim()
          ? `No songs match "${searchQuery}". Try different keywords or check your filters.`
          : "Type song title, description, genre, or key to find your songs"}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </Pressable>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Search Songs
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={Colors[colorScheme ?? "light"].icon}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search songs..."
              placeholderTextColor={Colors[colorScheme ?? "light"].icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={clearSearch} style={styles.clearButton}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors[colorScheme ?? "light"].icon}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <ThemedText style={styles.resultsCount}>
            {filteredAndSortedSongs.length} song
            {filteredAndSortedSongs.length !== 1 ? "s" : ""} found
          </ThemedText>
        </View>

        {/* Sort and Filter Controls */}
        <SortFilterControls />

        {/* Results */}
        <View style={styles.resultsContainer}>
          {filteredAndSortedSongs.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={filteredAndSortedSongs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongItem
                  song={item}
                  onDelete={handleDeleteSong}
                  onToggleFavorite={handleToggleFavorite}
                  colorScheme={colorScheme ?? "light"}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
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
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    placeholder: {
      width: 32,
    },
    searchSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 12,
      color: Colors[colorScheme].text,
    },
    clearButton: {
      padding: 4,
    },
    resultsHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    resultsCount: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      opacity: 0.8,
    },
    controlsSection: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    controlsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    controlsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    toggleButton: {
      padding: 4,
    },
    controlsContent: {
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    controlGroup: {
      marginBottom: 16,
    },
    controlLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colorScheme === "dark" ? "#333" : "#e9ecef",
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    chipSelected: {
      backgroundColor: Colors[colorScheme].tint,
      borderColor: Colors[colorScheme].tint,
    },
    chipText: {
      fontSize: 12,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    chipTextSelected: {
      color: colorScheme === "dark" ? "#000" : "#fff",
    },
    resultsContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    listContent: {
      paddingBottom: 100,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingTop: 60,
    },
    emptyIcon: {
      opacity: 0.3,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      textAlign: "center",
      lineHeight: 20,
      opacity: 0.7,
    },
    // Song item styles (copied from songs screen)
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
    songActions: {
      flexDirection: "row",
      gap: 8,
    },
    favoriteButton: {
      padding: 4,
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
  });
