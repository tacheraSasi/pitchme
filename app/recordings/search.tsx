import { RecordingListItem } from "@/components/recording-list-item";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { RecordingItem, useRecordingsList } from "@/stores/recordingsStore";
import { formatDate, formatTime } from "@/utils/lib";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SortOption = "date" | "title" | "duration";
type SortOrder = "asc" | "desc";

export default function RecordingsSearchScreen() {
  const colorScheme = useColorScheme();
  const recordings = useRecordingsList();
  const styles = getStyles(colorScheme ?? "light");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedRecordings = useMemo(() => {
    let filtered = recordings;

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((recording) =>
        recording.title.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "duration":
          comparison = a.durationMillis - b.durationMillis;
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [recordings, searchQuery, sortBy, sortOrder]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleRecordingLongPress = (recording: RecordingItem) => {
    // Handle long press - could open context menu
    console.log("Long pressed recording:", recording.id);
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
                { key: "date", label: "Date" },
                { key: "title", label: "Title" },
                { key: "duration", label: "Duration" },
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
        {searchQuery.trim() ? "No recordings found" : "Start searching"}
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        {searchQuery.trim()
          ? `No recordings match "${searchQuery}". Try different keywords.`
          : "Type recording title to find your musical ideas"}
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
            Search Recordings
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
              placeholder="Search recordings..."
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
            {filteredAndSortedRecordings.length} recording
            {filteredAndSortedRecordings.length !== 1 ? "s" : ""} found
          </ThemedText>
        </View>

        {/* Sort and Filter Controls */}
        <SortFilterControls />

        {/* Results */}
        <View style={styles.resultsContainer}>
          {filteredAndSortedRecordings.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={filteredAndSortedRecordings}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RecordingListItem
                  recording={item}
                  formatTime={formatTime}
                  formatDate={formatDate}
                  colorScheme={colorScheme ?? "light"}
                  styles={styles}
                  onLongPress={handleRecordingLongPress}
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
    // Recording item styles (reused from record screen)
    ideaItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#333333" : "#e9ecef",
      marginBottom: 12,
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
