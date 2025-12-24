import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

export default function Step1() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  const buttonScale = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(textFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        delay: 300,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        delay: 300,
      }),
    ]).start();
  }, []);

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
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: textFade,
              transform: [{ translateY: slideUp }],
            }
          ]}
        >
          <ThemedText style={styles.hookText}>
            Everyone can hear pitch.
          </ThemedText>
          <ThemedText style={styles.hookTextAccent}>
            Few can control it.
          </ThemedText>
          
          <ThemedView style={styles.subtitleContainer}>
            <ThemedText style={styles.subtitle}>
              Let's discover your potential in just a few steps
            </ThemedText>
          </ThemedView>
        </Animated.View>

        <Animated.View style={[
          styles.buttonContainer,
          { transform: [{ scale: buttonScale }] }
        ]}>
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            onPress={handleNext}
          >
            <ThemedText style={styles.nextButtonText}>Get Started</ThemedText>
            <ThemedView style={styles.chevronContainer}>
              <ThemedText style={styles.chevron}>→</ThemedText>
            </ThemedView>
          </Pressable>
          
          <ThemedView style={styles.stepIndicator}>
            <ThemedView style={styles.activeStep} />
            <ThemedView style={styles.inactiveStep} />
            <ThemedView style={styles.inactiveStep} />
          </ThemedView>
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
      paddingTop: 120,
      paddingBottom: 60,
    },
    textContainer: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    hookText: {
      fontSize: 44,
      fontWeight: "300",
      textAlign: "center",
      color: Colors[colorScheme].text,
      marginBottom: 12,
      letterSpacing: -0.8,
      lineHeight: 52,
    },
    hookTextAccent: {
      fontSize: 44,
      fontWeight: "800",
      textAlign: "center",
      color: Colors[colorScheme].tint,
      letterSpacing: -0.8,
      lineHeight: 52,
      marginBottom: 32,
    },
    subtitleContainer: {
      maxWidth: 300,
      marginTop: 20,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
      color: Colors[colorScheme].text + "90",
      lineHeight: 24,
    },
    buttonContainer: {
      width: "100%",
      alignItems: "center",
    },
    nextButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 20,
      paddingHorizontal: 40,
      borderRadius: 20,
      minWidth: 200,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: Colors[colorScheme].tint,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
      marginBottom: 32,
    },
    nextButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    nextButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000000" : "#ffffff",
      letterSpacing: 0.5,
      marginRight: 12,
    },
    chevronContainer: {
      opacity: 0.8,
    },
    chevron: {
      fontSize: 20,
      color: colorScheme === "dark" ? "#000000" : "#ffffff",
      fontWeight: "300",
    },
    stepIndicator: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    activeStep: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors[colorScheme].tint,
    },
    inactiveStep: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors[colorScheme].text + "30",
    },
  });