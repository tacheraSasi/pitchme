import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { getNoteAssets, Note } from "@/constants/notes";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useVoicePreset } from "@/stores/settingsStore";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

export default function Step2() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const voicePreset = useVoicePreset();
  const styles = getStyles(colorScheme ?? "light");

  // Get note assets
  const noteAssets = useMemo(() => getNoteAssets(voicePreset), [voicePreset]);

  // Audio players for the two notes
  const playerA = useAudioPlayer(noteAssets[Note.C]);
  const playerB = useAudioPlayer(noteAssets[Note.E]);

  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Animation refs
  const buttonAScale = useRef(new Animated.Value(1)).current;
  const buttonBScale = useRef(new Animated.Value(1)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const correctAnswer: "A" | "B" = "B"; // E is higher than C

  const playNote = useCallback(
    async (note: "A" | "B") => {
      if (isPlaying) return;
      setIsPlaying(true);
      haptics("light");

      try {
        if (note === "A") {
          playerA.seekTo(0);
          playerA.play();
        } else {
          playerB.seekTo(0);
          playerB.play();
        }

        // Stop after 1 second
        setTimeout(() => {
          if (note === "A") {
            playerA.pause();
          } else {
            playerB.pause();
          }
          setIsPlaying(false);
        }, 1000);
      } catch (error) {
        console.error("Error playing note:", error);
        setIsPlaying(false);
      }
    },
    [isPlaying, playerA, playerB, haptics]
  );

  const playBothNotes = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    haptics("light");

    try {
      // Play A first
      playerA.seekTo(0);
      playerA.play();
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Then play B
      playerB.seekTo(0);
      playerB.play();
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setIsPlaying(false);
    } catch (error) {
      console.error("Error playing notes:", error);
      setIsPlaying(false);
    }
  }, [isPlaying, playerA, playerB, haptics]);

  const handleAnswer = useCallback(
    (answer: "A" | "B") => {
      if (hasAnswered) return;

      setSelectedAnswer(answer);
      setHasAnswered(true);
      const isCorrect = answer === correctAnswer;

      // Animate button press
      const buttonScale = answer === "A" ? buttonAScale : buttonBScale;
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Show feedback
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      haptics(isCorrect ? "success" : "error");

      // Navigate after delay
      setTimeout(() => {
        router.push("./step3");
      }, 1500);
    },
    [hasAnswered, buttonAScale, buttonBScale, feedbackOpacity, haptics, router]
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.promptText}>
            Which one is higher?
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.buttonsContainer}>
          <Animated.View style={{ transform: [{ scale: buttonAScale }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.noteButton,
                selectedAnswer === "A" && styles.noteButtonSelected,
                selectedAnswer === "A" && correctAnswer === "B" &&
                  styles.noteButtonWrong,
                pressed && styles.noteButtonPressed,
              ]}
              onPress={() => handleAnswer("A")}
              onLongPress={() => playNote("A")}
              disabled={hasAnswered}
            >
              <ThemedText style={styles.noteButtonLabel}>A</ThemedText>
              <ThemedText style={styles.noteButtonHint}>
                Tap & hold to play
              </ThemedText>
            </Pressable>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonBScale }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.noteButton,
                selectedAnswer === "B" && styles.noteButtonSelected,
                selectedAnswer === "B" && "B" === correctAnswer &&
                  styles.noteButtonCorrect,
                pressed && styles.noteButtonPressed,
              ]}
              onPress={() => handleAnswer("B")}
              onLongPress={() => playNote("B")}
              disabled={hasAnswered}
            >
              <ThemedText style={styles.noteButtonLabel}>B</ThemedText>
              <ThemedText style={styles.noteButtonHint}>
                Tap & hold to play
              </ThemedText>
            </Pressable>
          </Animated.View>
        </ThemedView>

        {!hasAnswered && (
          <Pressable
            style={styles.playBothButton}
            onPress={playBothNotes}
            disabled={isPlaying}
          >
            <ThemedText style={styles.playBothText}>
              Play Both Notes
            </ThemedText>
          </Pressable>
        )}

        {hasAnswered && (
          <Animated.View
            style={[styles.feedbackContainer, { opacity: feedbackOpacity }]}
          >
            <ThemedText
              style={[
                styles.feedbackText,
                selectedAnswer === correctAnswer
                  ? styles.feedbackTextCorrect
                  : styles.feedbackTextWrong,
              ]}
            >
              {selectedAnswer === correctAnswer ? "Correct!" : "Try again!"}
            </ThemedText>
          </Animated.View>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingVertical: 60,
    },
    header: {
      marginBottom: 60,
      alignItems: "center",
    },
    promptText: {
      fontSize: 32,
      fontWeight: "600",
      textAlign: "center",
      color: Colors[colorScheme].text,
      letterSpacing: -0.5,
    },
    buttonsContainer: {
      flexDirection: "row",
      gap: 24,
      marginBottom: 40,
      width: "100%",
      justifyContent: "center",
    },
    noteButton: {
      flex: 1,
      aspectRatio: 1,
      maxWidth: 160,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 24,
      borderWidth: 3,
      borderColor: Colors[colorScheme].text + "20",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    noteButtonPressed: {
      opacity: 0.8,
    },
    noteButtonSelected: {
      borderColor: Colors[colorScheme].tint,
      borderWidth: 4,
    },
    noteButtonCorrect: {
      backgroundColor: Colors[colorScheme].tint + "15",
    },
    noteButtonWrong: {
      backgroundColor: Colors[colorScheme].isRecording + "20",
      borderColor: Colors[colorScheme].isRecording,
    },
    noteButtonLabel: {
      fontSize: 48,
      fontWeight: "700",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    noteButtonHint: {
      fontSize: 12,
      color: Colors[colorScheme].text,
      opacity: 0.6,
      fontWeight: "500",
    },
    playBothButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].tint + "15",
      marginBottom: 20,
    },
    playBothText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].tint,
    },
    feedbackContainer: {
      marginTop: 20,
      alignItems: "center",
    },
    feedbackText: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
    },
    feedbackTextCorrect: {
      color: Colors[colorScheme].tint,
    },
    feedbackTextWrong: {
      color: Colors[colorScheme].isRecording,
    },
  });
