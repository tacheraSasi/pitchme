import { ThemedText } from "@/components/themed/themed-text";
import { Colors } from "@/constants/theme";
import { useGlobalAudioPlayer } from "@/hooks/use-global-audioi-player";
import { RecordingItem, useRecordingsStore } from "@/stores/recordingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import { useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { alert } from "yooo-native";

export function RecordingListItem({
  recording,
  formatTime,
  formatDate,
  colorScheme,
  styles,
  onLongPress,
}: {
  recording: RecordingItem;
  formatTime: (millis: number) => string;
  formatDate: (dateString: string) => string;
  colorScheme: "light" | "dark";
  styles: any;
  onLongPress?: (recording: RecordingItem) => void;
}) {
  const { player, playExclusive, pause } = useGlobalAudioPlayer(recording.uri);
  const playerStatus = useAudioPlayerStatus(player);
  const { removeRecording } = useRecordingsStore();

  const translateX = useRef(new Animated.Value(0)).current;
  const panRef = useRef(null);
  const isDark = colorScheme === "dark";
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );

  const SWIPE_THRESHOLD = -80;
  const DETAILS_SWIPE_THRESHOLD = 80;

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
    translateX.setValue(translationX);

    // Update swipe direction based on translation
    if (Math.abs(translationX) > 10) {
      setSwipeDirection(translationX > 0 ? "right" : "left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleDetailsSwipe = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress(recording);
    }
  };

  const onPanHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      if (translationX <= SWIPE_THRESHOLD) {
        Animated.timing(translateX, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          handleDeleteRecording();
        });
      } else if (translationX >= DETAILS_SWIPE_THRESHOLD) {
        Animated.timing(translateX, {
          toValue: 200,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          handleDetailsSwipe();
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start(() => {
          setSwipeDirection(null);
        });
      }
    }
  };

  const handleDeleteRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    alert.dialog(
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
              Animated.timing(translateX, {
                toValue: -500,
                duration: 300,
                useNativeDriver: true,
              }).start(async () => {
                try {
                  const file = new FileSystem.File(recording.uri);
                  file.delete();
                  await removeRecording(recording.id);
                } catch (error) {
                  console.error("Error deleting recording:", error);
                  alert.error("Failed to delete recording.");
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
      {/* Delete Background (Left Swipe) - Only show when swiping left */}
      {swipeDirection === "left" && (
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
      )}
      {/* Details Background (Right Swipe) - Only show when swiping right */}
      {swipeDirection === "right" && (
        <View
          style={[
            swipeStyles.detailsBackground,
            {
              backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
            },
          ]}
        >
          <Entypo
            name="info"
            size={30}
            color={isDark ? Colors.dark.background : "white"}
            style={swipeStyles.detailsIcon}
          />
        </View>
      )}{" "}
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
        activeOffsetX={[-10, 10]}
        activeOffsetY={[-1000, 1000]}
        minPointers={1}
      >
        <Animated.View
          style={[
            recordingItemStyles.container,
            {
              transform: [{ translateX }],
              borderWidth: 1.5,
              borderColor: colorScheme === "dark" ? "#333333" : "#e9ecef",
              backgroundColor: isDark
                ? Colors.dark.background
                : Colors.light.background,
            },
          ]}
        >
          <View style={recordingItemStyles.iconContainer}>
            <View
              style={[
                recordingItemStyles.iconBackground,
                {
                  backgroundColor: isDark
                    ? Colors.dark.tint
                    : Colors.light.tint,
                },
              ]}
            >
              <Entypo
                name="sound-mix"
                size={24}
                color={isDark ? Colors.dark.background : "white"}
              />
            </View>
          </View>

          <View style={recordingItemStyles.contentContainer}>
            <View style={recordingItemStyles.titleContainer}>
              <ThemedText style={recordingItemStyles.title} numberOfLines={1}>
                {recording.title}
              </ThemedText>
              {playerStatus.playing && (
                <View style={recordingItemStyles.playingIndicator}>
                  <View
                    style={[
                      recordingItemStyles.playingDot,
                      {
                        backgroundColor: isDark
                          ? Colors.dark.tint
                          : Colors.light.tint,
                      },
                    ]}
                  />
                  <ThemedText style={recordingItemStyles.playingText}>
                    Playing
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={recordingItemStyles.metadataContainer}>
              <View style={recordingItemStyles.durationContainer}>
                <Entypo
                  name="clock"
                  size={12}
                  color={isDark ? Colors.dark.icon : Colors.light.icon}
                />
                <ThemedText style={recordingItemStyles.duration}>
                  {formatTime(recording.durationMillis)}
                </ThemedText>
              </View>

              <View style={recordingItemStyles.separator} />

              <View style={recordingItemStyles.dateContainer}>
                <Entypo
                  name="calendar"
                  size={12}
                  color={isDark ? Colors.dark.icon : Colors.light.icon}
                />
                <ThemedText style={recordingItemStyles.date}>
                  {formatDate(recording.date)}
                </ThemedText>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              recordingItemStyles.playButton,
              {
                backgroundColor: pressed
                  ? isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)"
                  : isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)",
              },
            ]}
            onPress={togglePlayback}
          >
            <Entypo
              name={
                playerStatus.playing ? "controller-paus" : "controller-play"
              }
              size={20}
              color={isDark ? Colors.dark.tint : Colors.light.tint}
            />
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  deleteIcon: {},
  detailsBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  detailsIcon: {},
  itemContainer: {
    backgroundColor: "transparent",
  },
});

const recordingItemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderColor:"gray",
    borderWidth:2,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  playingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  playingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  playingText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  duration: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
    opacity: 0.7,
  },
  separator: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    marginHorizontal: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "400",
    opacity: 0.6,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
