import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

export default function Step1() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    haptics("light");
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
    ]).start(() => {
      router.push("./step2");
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.textContainer}>
          <ThemedText style={styles.hookText}>
            Everyone can hear pitch.
          </ThemedText>
          <ThemedText style={styles.hookTextAccent}>
            Few can control it.
          </ThemedText>
        </ThemedView>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            onPress={handleNext}
          >
            <ThemedText style={styles.nextButtonText}>Next</ThemedText>
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
    hookText: {
      fontSize: 42,
      fontWeight: "300",
      textAlign: "center",
      color: Colors[colorScheme].text,
      marginBottom: 12,
      letterSpacing: -0.5,
    },
    hookTextAccent: {
      fontSize: 42,
      fontWeight: "700",
      textAlign: "center",
      color: Colors[colorScheme].tint,
      letterSpacing: -0.5,
    },
    nextButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 18,
      paddingHorizontal: 48,
      borderRadius: 16,
      minWidth: 140,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    nextButtonPressed: {
      opacity: 0.8,
    },
    nextButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000000" : "#ffffff",
      letterSpacing: 0.5,
    },
  });
