import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { getNoteAssets, Note } from "@/constants/notes";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useVoicePreset } from "@/stores/settingsStore";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

export default function Step2() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const voicePreset = useVoicePreset();
  const styles = getStyles(colorScheme ?? "light");

  const noteAssets = useMemo(() => getNoteAssets(voicePreset), [voicePreset]);
  const playerA = useAudioPlayer(noteAssets[Note.C]);
  const playerB = useAudioPlayer(noteAssets[Note.E]);

  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const correctAnswer: "A" | "B" = "B";

  const playNote = useCallback(
    async (note: "A" | "B") => {
      if (isPlaying) return;
      setIsPlaying(true);
      haptics("light");

      try {
        const player = note === "A" ? playerA : playerB;
        player.seekTo(0);
        player.play();

        setTimeout(() => {
          player.pause();
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
    if (isPlaying || hasAnswered) return;
    setIsPlaying(true);
    haptics("medium");

    try {
      playerA.seekTo(0);
      playerA.play();
      await new Promise((resolve) => setTimeout(resolve, 1200));

      playerB.seekTo(0);
      playerB.play();
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setIsPlaying(false);
    } catch (error) {
      console.error("Error playing notes:", error);
      setIsPlaying(false);
    }
  }, [isPlaying, hasAnswered, playerA, playerB, haptics]);

  const handleAnswer = useCallback(
    (answer: "A" | "B") => {
      if (hasAnswered) return;

      setSelectedAnswer(answer);
      setHasAnswered(true);
      const isCorrect = answer === correctAnswer;

      haptics(isCorrect ? "success" : "error");

      setTimeout(() => {
        router.push("./step3");
      }, 1500);
    },
    [hasAnswered, haptics, router]
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.promptText}>
            Which one is higher?
          </ThemedText>
          <ThemedText style={styles.promptSubtext}>
            Tap to answer • Hold to play
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.buttonsContainer}>
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
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.noteButton,
              selectedAnswer === "B" && styles.noteButtonSelected,
              selectedAnswer === "B" && correctAnswer === "B" &&
              styles.noteButtonCorrect,
              pressed && styles.noteButtonPressed,
            ]}
            onPress={() => handleAnswer("B")}
            onLongPress={() => playNote("B")}
            disabled={hasAnswered}
          >
            <ThemedText style={styles.noteButtonLabel}>B</ThemedText>
          </Pressable>
        </ThemedView>

        {!hasAnswered && (
          <Pressable
            style={({ pressed }) => [
              styles.playBothButton,
              pressed && styles.playBothButtonPressed,
              isPlaying && styles.playBothButtonDisabled,
            ]}
            onPress={playBothNotes}
            disabled={isPlaying}
          >
            <ThemedText style={styles.playBothText}>
              Play Both
            </ThemedText>
          </Pressable>
        )}

        {hasAnswered && (
          <ThemedView style={styles.feedbackContainer}>
            <ThemedText
              style={[
                styles.feedbackText,
                selectedAnswer === correctAnswer
                  ? styles.feedbackTextCorrect
                  : styles.feedbackTextWrong,
              ]}
            >
              {selectedAnswer === correctAnswer ? "Correct!" : "Not quite"}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.stepIndicator}>
          <ThemedView style={styles.inactiveStep} />
          <ThemedView style={styles.activeStep} />
          <ThemedView style={styles.inactiveStep} />
        </ThemedView>
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
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingTop: 100,
      paddingBottom: 60,
    },
    header: {
      alignItems: "center",
    },
    promptText: {
      fontSize: 28,
      fontWeight: "600",
      textAlign: "center",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    promptSubtext: {
      fontSize: 15,
      fontWeight: "400",
      textAlign: "center",
      color: Colors[colorScheme].text + "60",
    },
    buttonsContainer: {
      flexDirection: "row",
      gap: 16,
      width: "100%",
      justifyContent: "center",
    },
    noteButton: {
      flex: 1,
      aspectRatio: 1,
      maxWidth: 140,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: Colors[colorScheme].text + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    noteButtonPressed: {
      opacity: 0.7,
    },
    noteButtonSelected: {
      borderColor: Colors[colorScheme].tint,
      borderWidth: 3,
    },
    noteButtonCorrect: {
      backgroundColor: Colors[colorScheme].tint + "10",
      borderColor: Colors[colorScheme].tint,
    },
    noteButtonWrong: {
      backgroundColor: Colors[colorScheme].isRecording + "10",
      borderColor: Colors[colorScheme].isRecording,
    },
    noteButtonLabel: {
      fontSize: 48,
      fontWeight: "600",
      padding: 20,
      color: Colors[colorScheme].text,
    },
    playBothButton: {
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].tint + "10",
    },
    playBothButtonPressed: {
      opacity: 0.7,
    },
    playBothButtonDisabled: {
      opacity: 0.4,
    },
    playBothText: {
      fontSize: 15,
      fontWeight: "600",
      color: Colors[colorScheme].tint,
    },
    feedbackContainer: {
      alignItems: "center",
    },
    feedbackText: {
      fontSize: 22,
      fontWeight: "600",
      textAlign: "center",
    },
    feedbackTextCorrect: {
      color: Colors[colorScheme].tint,
    },
    feedbackTextWrong: {
      color: Colors[colorScheme].isRecording,
    },
    stepIndicator: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    activeStep: {
      width: 24,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors[colorScheme].tint,
    },
    inactiveStep: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors[colorScheme].text + "20",
    },
  });
