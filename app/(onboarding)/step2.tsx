import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { getNoteAssets, Note } from "@/constants/notes";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useVoicePreset } from "@/stores/settingsStore";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Animated, Pressable, StyleSheet, Easing } from "react-native";

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
  const [showHint, setShowHint] = useState(false);

  // Animation refs
  const buttonAScale = useRef(new Animated.Value(1)).current;
  const buttonBScale = useRef(new Animated.Value(1)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const containerSlide = useRef(new Animated.Value(50)).current;
  const containerFade = useRef(new Animated.Value(0)).current;
  const hintPulse = useRef(new Animated.Value(1)).current;

  const correctAnswer: "A" | "B" = "B"; // E is higher than C

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(containerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(containerSlide, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Show hint after delay
    const timer = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Pulse animation for hint
  useEffect(() => {
    if (showHint && !hasAnswered) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(hintPulse, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(hintPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      hintPulse.setValue(1);
    }
  }, [showHint, hasAnswered]);

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
    haptics("medium");
    
    // Scale animation
    Animated.sequence([
      Animated.timing(hintPulse, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(hintPulse, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

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
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: containerFade,
            transform: [{ translateY: containerSlide }],
          }
        ]}
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.stepIndicator}>Step 2/3</ThemedText>
          <ThemedText style={styles.promptText}>
            Which one is higher?
          </ThemedText>
          <ThemedText style={styles.promptSubtext}>
            Listen carefully to the pitch
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.buttonsContainer}>
          <Animated.View style={{ transform: [{ scale: buttonAScale }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.noteButton,
                styles.noteButtonA,
                selectedAnswer === "A" && styles.noteButtonSelected,
                selectedAnswer === "A" && correctAnswer === "B" &&
                  styles.noteButtonWrong,
                pressed && styles.noteButtonPressed,
              ]}
              onPress={() => handleAnswer("A")}
              onLongPress={() => playNote("A")}
              disabled={hasAnswered}
            >
              <ThemedView style={styles.noteButtonIcon}>
                <ThemedText style={styles.noteIcon}>♪</ThemedText>
              </ThemedView>
              <ThemedText style={styles.noteButtonLabel}>A</ThemedText>
              <ThemedText style={styles.noteButtonHint}>
                Tap & hold to play
              </ThemedText>
              <ThemedText style={styles.noteName}>C4</ThemedText>
            </Pressable>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonBScale }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.noteButton,
                styles.noteButtonB,
                selectedAnswer === "B" && styles.noteButtonSelected,
                selectedAnswer === "B" && "B" === correctAnswer &&
                  styles.noteButtonCorrect,
                pressed && styles.noteButtonPressed,
              ]}
              onPress={() => handleAnswer("B")}
              onLongPress={() => playNote("B")}
              disabled={hasAnswered}
            >
              <ThemedView style={styles.noteButtonIcon}>
                <ThemedText style={styles.noteIcon}>♪</ThemedText>
              </ThemedView>
              <ThemedText style={styles.noteButtonLabel}>B</ThemedText>
              <ThemedText style={styles.noteButtonHint}>
                Tap & hold to play
              </ThemedText>
              <ThemedText style={styles.noteName}>E4</ThemedText>
            </Pressable>
          </Animated.View>
        </ThemedView>

        <ThemedView style={styles.controlsContainer}>
          <Animated.View style={{ transform: [{ scale: hintPulse }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.playBothButton,
                pressed && styles.playBothButtonPressed,
                isPlaying && styles.playBothButtonDisabled,
              ]}
              onPress={playBothNotes}
              disabled={isPlaying || hasAnswered}
            >
              <ThemedView style={styles.playIcon}>
                <ThemedText style={styles.playIconText}>▶▶</ThemedText>
              </ThemedView>
              <ThemedText style={styles.playBothText}>
                Play Both Notes
              </ThemedText>
            </Pressable>
          </Animated.View>

          {showHint && !hasAnswered && (
            <ThemedText style={styles.hintText}>
              Tip: Hold a button to hear the note
            </ThemedText>
          )}
        </ThemedView>

        {hasAnswered && (
          <Animated.View
            style={[styles.feedbackContainer, { opacity: feedbackOpacity }]}
          >
            <ThemedView style={styles.feedbackContent}>
              <ThemedText
                style={[
                  styles.feedbackIcon,
                  selectedAnswer === correctAnswer
                    ? styles.feedbackIconCorrect
                    : styles.feedbackIconWrong,
                ]}
              >
                {selectedAnswer === correctAnswer ? "✓" : "✗"}
              </ThemedText>
              <ThemedText
                style={[
                  styles.feedbackText,
                  selectedAnswer === correctAnswer
                    ? styles.feedbackTextCorrect
                    : styles.feedbackTextWrong,
                ]}
              >
                {selectedAnswer === correctAnswer ? "Perfect!" : "Not quite!"}
              </ThemedText>
              <ThemedText style={styles.feedbackSubtext}>
                {selectedAnswer === correctAnswer
                  ? "You have a good ear!"
                  : "The higher note was B (E4)"}
              </ThemedText>
            </ThemedView>
          </Animated.View>
        )}
      </Animated.View>
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
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    header: {
      marginBottom: 48,
      alignItems: "center",
    },
    stepIndicator: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].text + "60",
      marginBottom: 12,
      letterSpacing: 1,
    },
    promptText: {
      fontSize: 36,
      fontWeight: "700",
      textAlign: "center",
      color: Colors[colorScheme].text,
      letterSpacing: -0.8,
      marginBottom: 8,
    },
    promptSubtext: {
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
      color: Colors[colorScheme].text + "70",
    },
    buttonsContainer: {
      flexDirection: "row",
      gap: 20,
      marginBottom: 40,
      width: "100%",
      justifyContent: "center",
    },
    noteButton: {
      flex: 1,
      aspectRatio: 0.9,
      maxWidth: 160,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: Colors[colorScheme].borderColor,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    noteButtonA: {
      borderTopColor: Colors[colorScheme].tint + "40",
      borderTopWidth: 4,
    },
    noteButtonB: {
      borderTopColor: "#FF6B6B" + "40",
      borderTopWidth: 4,
    },
    noteButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    noteButtonSelected: {
      borderColor: Colors[colorScheme].tint,
      borderWidth: 3,
    },
    noteButtonCorrect: {
      backgroundColor: Colors[colorScheme].tint + "15",
      borderColor: Colors[colorScheme].tint,
    },
    noteButtonWrong: {
      backgroundColor: Colors[colorScheme].isRecording + "10",
      borderColor: Colors[colorScheme].isRecording,
    },
    noteButtonIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: Colors[colorScheme].background,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    noteIcon: {
      fontSize: 28,
      color: Colors[colorScheme].tint,
    },
    noteButtonLabel: {
      fontSize: 36,
      fontWeight: "700",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    noteButtonHint: {
      fontSize: 12,
      color: Colors[colorScheme].text,
      opacity: 0.6,
      fontWeight: "500",
      marginBottom: 8,
    },
    noteName: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].text + "50",
      fontFamily: "monospace",
    },
    controlsContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    playBothButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 16,
      backgroundColor: Colors[colorScheme].tint + "15",
      marginBottom: 16,
    },
    playBothButtonPressed: {
      opacity: 0.8,
    },
    playBothButtonDisabled: {
      opacity: 0.5,
    },
    playIcon: {
      marginRight: 12,
    },
    playIconText: {
      fontSize: 16,
      color: Colors[colorScheme].tint,
    },
    playBothText: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].tint,
    },
    hintText: {
      fontSize: 14,
      color: Colors[colorScheme].text + "50",
      fontStyle: "italic",
    },
    feedbackContainer: {
      marginTop: 20,
      alignItems: "center",
      width: "100%",
    },
    feedbackContent: {
      alignItems: "center",
      backgroundColor: Colors[colorScheme].background,
      padding: 24,
      borderRadius: 20,
      width: "100%",
      maxWidth: 300,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    feedbackIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    feedbackIconCorrect: {
      color: Colors[colorScheme].tint,
    },
    feedbackIconWrong: {
      color: Colors[colorScheme].isRecording,
    },
    feedbackText: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 8,
    },
    feedbackTextCorrect: {
      color: Colors[colorScheme].tint,
    },
    feedbackTextWrong: {
      color: Colors[colorScheme].isRecording,
    },
    feedbackSubtext: {
      fontSize: 16,
      color: Colors[colorScheme].text + "70",
      textAlign: "center",
    },
  });