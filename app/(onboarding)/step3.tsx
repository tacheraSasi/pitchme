import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import {
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
} from "expo-audio";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { alert } from "yooo-native";

export default function Step3() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  const [isRequesting, setIsRequesting] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleLetsRecord = async () => {
    if (isRequesting) return;

    setIsRequesting(true);
    haptics("medium");

    // Animate button press
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

    try {
      // Request microphone permission
      const { granted } = await requestRecordingPermissionsAsync();

      if (!granted) {
        alert.error(
          "Microphone access is required to record audio. Please enable it in your device settings."
        );
        setIsRequesting(false);
        return;
      }

      // Set audio mode
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      haptics("success");

      // Navigate to main app
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 300);
    } catch (error) {
      console.error("Error requesting permissions:", error);
      alert.error("Failed to request microphone permission.");
      setIsRequesting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.textContainer}>
          <ThemedText style={styles.rewardText}>
            Your ears work.
          </ThemedText>
          <ThemedText style={styles.rewardTextAccent}>
            Now we'll help you control them.
          </ThemedText>
        </ThemedView>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={({ pressed }) => [
              styles.recordButton,
              pressed && styles.recordButtonPressed,
              isRequesting && styles.recordButtonDisabled,
            ]}
            onPress={handleLetsRecord}
            disabled={isRequesting}
          >
            <ThemedText style={styles.recordButtonText}>
              {isRequesting ? "Setting up..." : "Let's Record"}
            </ThemedText>
          </Pressable>
        </Animated.View>
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
    textContainer: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    rewardText: {
      fontSize: 38,
      fontWeight: "300",
      textAlign: "center",
      color: Colors[colorScheme].text,
      marginBottom: 16,
      letterSpacing: -0.5,
    },
    rewardTextAccent: {
      fontSize: 38,
      fontWeight: "700",
      textAlign: "center",
      color: Colors[colorScheme].tint,
      letterSpacing: -0.5,
    },
    recordButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 20,
      paddingHorizontal: 56,
      borderRadius: 16,
      minWidth: 200,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    recordButtonPressed: {
      opacity: 0.8,
    },
    recordButtonDisabled: {
      opacity: 0.6,
    },
    recordButtonText: {
      fontSize: 20,
      fontWeight: "700",
      color: colorScheme === "dark" ? "#000000" : "#ffffff",
      letterSpacing: 0.5,
    },
  });
