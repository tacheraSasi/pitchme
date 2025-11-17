import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Song, useRecentlyViewedSongs } from "@/stores/songsStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

interface RecentSongItemProps {
  song: Song;
  colorScheme: "light" | "dark";
}

const RecentSongItem = ({ song, colorScheme }: RecentSongItemProps) => {
  const styles = getStyles(colorScheme); //NOTE: maybe  ill get this straigh from the hook


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
      <View style={styles.songContent}>
        <View style={styles.songHeader}>
          <ThemedText style={styles.songTitle} numberOfLines={1}>
            {song.title}
          </ThemedText>
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
          />
        </View>

        <View style={styles.songDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="musical-note"
              size={12}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.detailText}>{song.key}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="speedometer-outline"
              size={12}
              color={Colors[colorScheme].icon}
            />
            <ThemedText style={styles.detailText}>{song.bpm}</ThemedText>
          </View>
          {song.isFavorite && (
            <View style={styles.detailRow}>
              <Ionicons name="heart" size={12} color="#FF6B6B" />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export function RecentlyViewed() {
  const colorScheme = useColorScheme();
  const recentlyViewed = useRecentlyViewedSongs();
  const styles = getStyles(colorScheme ?? "light");

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Recently Viewed Songs</ThemedText>
        <Pressable
          style={styles.viewAllButton}
          onPress={() => router.push("/songs" as any)}
        >
          <ThemedText style={styles.viewAllText}>View All</ThemedText>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentlyViewed.map((song) => (
          <RecentSongItem
            key={song.id}
            song={song}
            colorScheme={colorScheme ?? "light"}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: Colors[colorScheme].text,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    viewAllText: {
      fontSize: 14,
      color: Colors[colorScheme].tint,
      fontWeight: "600",
    },
    scrollContent: {
      gap: 12,
      paddingRight: 16,
    },
    songItem: {
      width: 160,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    songContent: {
      flex: 1,
    },
    songHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    songTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      flex: 1,
      marginRight: 8,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    songDetails: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    detailText: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
    },
  });
