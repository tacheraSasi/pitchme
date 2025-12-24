import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export default function Step1() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  const handleNext = () => {
    haptics("light");
    router.push("./step2");
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

        <ThemedView style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            onPress={handleNext}
          >
            <ThemedText style={styles.nextButtonText}>
              Let's Find Out
            </ThemedText>
          </Pressable>

          <ThemedView style={styles.stepIndicator}>
            <ThemedView style={styles.activeStep} />
            <ThemedView style={styles.inactiveStep} />
            <ThemedView style={styles.inactiveStep} />
          </ThemedView>
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
      paddingTop: 120,
      paddingBottom: 60,
    },
    textContainer: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    hookText: {
      fontSize: 36,
      fontWeight: "400",
      textAlign: "center",
      color: Colors[colorScheme].text,
      marginBottom: 8,
      letterSpacing: -0.5,
      lineHeight: 44,
    },
    hookTextAccent: {
      fontSize: 36,
      fontWeight: "700",
      textAlign: "center",
      color: Colors[colorScheme].tint,
      letterSpacing: -0.5,
      lineHeight: 44,
    },
    bottomSection: {
      width: "100%",
      alignItems: "center",
    },
    nextButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 18,
      paddingHorizontal: 48,
      borderRadius: 16,
      width: "100%",
      alignItems: "center",
      marginBottom: 24,
    },
    nextButtonPressed: {
      opacity: 0.7,
    },
    nextButtonText: {
      fontSize: 17,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000000" : "#ffffff",
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
