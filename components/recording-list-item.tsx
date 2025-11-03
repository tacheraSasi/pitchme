import { ThemedText } from "@/components/themed/themed-text";
import { Colors } from "@/constants/theme";
import { useGlobalAudioPlayer } from "@/hooks/use-global-audioi-player";
import { RecordingItem, useRecordingsStore } from "@/stores/recordingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import { useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Alert, Animated, Pressable, StyleSheet, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";

export function RecordingListItem({
  recording,
  formatTime,
  formatDate,
  colorScheme,
  styles,
}: {
  recording: RecordingItem;
  formatTime: (millis: number) => string;
  formatDate: (dateString: string) => string;
  colorScheme: "light" | "dark";
  styles: any;
}) {
  const { player, playExclusive, pause } = useGlobalAudioPlayer(recording.uri);
  const playerStatus = useAudioPlayerStatus(player);
  const { removeRecording } = useRecordingsStore();

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const panRef = useRef(null);
  const isDark = colorScheme === "dark";

  const SWIPE_THRESHOLD = -80;

  const togglePlayback = async () => {
    if (playerStatus.playing) {
      await pause();
    } else {
      if (playerStatus.currentTime >= playerStatus.duration) {
        player.seekTo(0);
      }
      await playExclusive();
    }
  };

  const onPanGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;

    if (translationX <= 0) {
      translateX.setValue(translationX);
    }
  };

  const onPanHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      if (translationX <= SWIPE_THRESHOLD) {
        // Swipe far enough - animate and show delete confirmation
        Animated.timing(translateX, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          handleDeleteRecording();
        });
      } else {
        // Return to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const handleDeleteRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Recording",
      `Are you sure you want to delete "${recording.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Animate out before deleting
              Animated.timing(translateX, {
                toValue: -500,
                duration: 300,
                useNativeDriver: true,
              }).start(async () => {
                try {
                  const file = new FileSystem.File(recording.uri);
                  await file.delete();
                  await removeRecording(recording.id);
                } catch (error) {
                  console.error("Error deleting recording:", error);
                  Alert.alert("Error", "Failed to delete recording.");
                }
              });
            } catch (error) {
              console.error("Error in delete animation:", error);
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={swipeStyles.container}>
      <View
        style={[
          swipeStyles.deleteBackground,
          {
            backgroundColor: isDark
              ? Colors.dark.isRecording
              : Colors.light.isRecording,
          },
        ]}
      >
        <Entypo
          name="trash"
          size={30}
          color="white"
          style={swipeStyles.deleteIcon}
        />
      </View>

      {/* Swipeable Item */}
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
        activeOffsetX={[-10, 10]}
        minPointers={1}
      >
        <Animated.View
          style={[
            styles.ideaItem,
            swipeStyles.itemContainer,
            {
              transform: [{ translateX }],
              backgroundColor: isDark
                ? Colors.dark.background
                : Colors.light.background,
              marginBottom: 0, // Handled by container
            },
          ]}
        >
          <Pressable style={styles.ideaIconContainer}>
            <Entypo name="sound-mix" size={22} color="white" />
          </Pressable>

          <View style={styles.ideaContent}>
            <ThemedText style={styles.ideaTitle} numberOfLines={1}>
              {recording.title}
            </ThemedText>
            <View style={styles.ideaMetadata}>
              <ThemedText style={styles.ideaDuration}>
                {formatTime(recording.durationMillis)}
              </ThemedText>
              <ThemedText style={styles.ideaDate}>
                {formatDate(recording.date)}
              </ThemedText>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={togglePlayback}
          >
            <Entypo
              name={
                playerStatus.playing ? "controller-paus" : "controller-play"
              }
              size={18}
              color={isDark ? "#7B6AE0" : Colors.light.tint}
            />
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  deleteBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
  },
  deleteIcon: {
  },
  itemContainer: {
    backgroundColor: "transparent",
  },
});
