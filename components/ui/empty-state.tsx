import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={80}
          color={Colors[colorScheme ?? "light"].icon}
          style={styles.icon}
        />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.actionButton}>
          <ThemedText style={styles.actionText}>{actionLabel}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Empty state for songs list
 */
export function EmptySongsState({ onCreateSong }: { onCreateSong?: () => void }) {
  return (
    <EmptyState
      icon="musical-notes-outline"
      title="No Songs Yet"
      description="Start creating your musical masterpieces! Tap the button below to write your first song."
      actionLabel={onCreateSong ? "Create Your First Song" : undefined}
      onAction={onCreateSong}
    />
  );
}

/**
 * Empty state for recordings list
 */
export function EmptyRecordingsState({ onAddRecording }: { onAddRecording?: () => void }) {
  return (
    <EmptyState
      icon="mic-outline"
      title="No Recordings Yet"
      description="Capture your musical ideas! Tap below to start recording your first take."
      actionLabel={onAddRecording ? "Add Your First Recording" : undefined}
      onAction={onAddRecording}
    />
  );
}

/**
 * Empty state for song recordings in song detail view
 */
export function EmptySongRecordingsState({ onAddRecording }: { onAddRecording?: () => void }) {
  return (
    <EmptyState
      icon="mic-outline"
      title="No Recordings Yet"
      description="No recordings yet. Tap 'Add Recording' to capture your musical ideas!"
      actionLabel={onAddRecording ? "Add Recording" : undefined}
      onAction={onAddRecording}
    />
  );
}

/**
 * Empty state for search results
 */
export function EmptySearchState({ searchQuery }: { searchQuery?: string }) {
  return (
    <EmptyState
      icon="search-outline"
      title="No Results Found"
      description={
        searchQuery
          ? `We couldn't find anything matching "${searchQuery}". Try a different search term.`
          : "Try searching for songs, recordings, or tags."
      }
    />
  );
}

/**
 * Empty state for chord progressions
 */
export function EmptyChordProgressionsState({
  onAddProgression,
}: {
  onAddProgression?: () => void;
}) {
  return (
    <EmptyState
      icon="musical-note-outline"
      title="No Chord Progressions"
      description="Add chord progressions to organize your song's harmonic structure."
      actionLabel={onAddProgression ? "Add Progression" : undefined}
      onAction={onAddProgression}
    />
  );
}

/**
 * Empty state for recently viewed
 */
export function EmptyRecentlyViewedState() {
  return (
    <EmptyState
      icon="time-outline"
      title="No Recently Viewed"
      description="Songs you view will appear here for quick access."
    />
  );
}

/**
 * Loading/error state for when data fails to load
 */
export function ErrorState({
  onRetry,
  message = "Something went wrong. Please try again.",
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Oops!"
      description={message}
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
    />
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingVertical: 48,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: Colors[colorScheme].icon + "15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    icon: {
      opacity: 0.6,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 12,
      color: Colors[colorScheme].text,
    },
    description: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
      color: Colors[colorScheme].icon,
      marginBottom: 24,
      maxWidth: 320,
    },
    actionButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 8,
    },
    actionText: {
      fontSize: 16,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000" : "#fff",
    },
  });
