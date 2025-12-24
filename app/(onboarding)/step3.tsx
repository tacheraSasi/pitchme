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
import { useRef, useState, useEffect } from "react";
import { Animated, Pressable, StyleSheet, Easing } from "react-native";
import { alert } from "yooo-native";

export default function Step3() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Animation refs
  const buttonScale = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Entry animations
  useEffect(() => {
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
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
        delay: 300,
      }),
    ]).start();

    // Microphone icon animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

    // Loading animation for mic icon
    Animated.loop(
      Animated.timing(iconRotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    try {
      // Request microphone permission
      const { granted } = await requestRecordingPermissionsAsync();

      if (!granted) {
        alert.error(
          "Microphone access is required to record audio. Please enable it in your device settings."
        );
        setIsRequesting(false);
        iconRotation.stopAnimation();
        return;
      }

      // Set audio mode
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      haptics("success");
      
      // Success animation
      Animated.parallel([
        Animated.timing(iconRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1.1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate to main app
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 800);
    } catch (error) {
      console.error("Error requesting permissions:", error);
      alert.error("Failed to request microphone permission.");
      setIsRequesting(false);
      iconRotation.stopAnimation();
    }
  };

  const spin = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
          <Animated.View style={[
            styles.micContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <ThemedView style={styles.micBackground}>
              <ThemedText style={styles.micIcon}>🎤</ThemedText>
            </ThemedView>
            <Animated.View style={[
              styles.loadingRing,
              { transform: [{ rotate: spin }] },
              isRequesting && styles.loadingRingActive
            ]} />
          </Animated.View>

          <ThemedText style={styles.rewardText}>
            Your ears work.
          </ThemedText>
          <ThemedText style={styles.rewardTextAccent}>
            Now let's train your voice.
          </ThemedText>
          
          <ThemedView style={styles.featureList}>
            <ThemedView style={styles.featureItem}>
              <ThemedView style={styles.featureIcon}>
                <ThemedText style={styles.checkIcon}>✓</ThemedText>
              </ThemedView>
              <ThemedText style={styles.featureText}>
                Real-time pitch feedback
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.featureItem}>
              <ThemedView style={styles.featureIcon}>
                <ThemedText style={styles.checkIcon}>✓</ThemedText>
              </ThemedView>
              <ThemedText style={styles.featureText}>
                Personalized exercises
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.featureItem}>
              <ThemedView style={styles.featureIcon}>
                <ThemedText style={styles.checkIcon}>✓</ThemedText>
              </ThemedView>
              <ThemedText style={styles.featureText}>
                Progress tracking
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Animated.View>

        <Animated.View style={[
          styles.buttonWrapper,
          { transform: [{ scale: buttonScale }] }
        ]}>
          <Pressable
            style={({ pressed }) => [
              styles.recordButton,
              pressed && styles.recordButtonPressed,
              isRequesting && styles.recordButtonDisabled,
            ]}
            onPress={handleLetsRecord}
            disabled={isRequesting}
          >
            <ThemedView style={styles.buttonContent}>
              {isRequesting ? (
                <>
                  <ThemedView style={styles.loadingDot} />
                  <ThemedView style={[styles.loadingDot, styles.loadingDot2]} />
                  <ThemedView style={[styles.loadingDot, styles.loadingDot3]} />
                </>
              ) : (
                <ThemedText style={styles.recordButtonIcon}>🎤</ThemedText>
              )}
              <ThemedText style={styles.recordButtonText}>
                {isRequesting ? "Setting up microphone..." : "Enable Microphone"}
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.permissionHint}>
              We need microphone access for pitch detection
            </ThemedText>
          </Pressable>

          <ThemedView style={styles.stepIndicator}>
            <ThemedView style={styles.inactiveStep} />
            <ThemedView style={styles.inactiveStep} />
            <ThemedView style={styles.activeStep} />
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
      paddingTop: 80,
      paddingBottom: 60,
    },
    textContainer: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      width: "100%",
    },
    micContainer: {
      position: "relative",
      marginBottom: 40,
    },
    micBackground: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: Colors[colorScheme].tint + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    micIcon: {
      fontSize: 48,
    },
    loadingRing: {
      position: "absolute",
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: "transparent",
      borderTopColor: Colors[colorScheme].tint + "30",
    },
    loadingRingActive: {
      borderTopColor: Colors[colorScheme].tint,
    },
    rewardText: {
      fontSize: 40,
      fontWeight: "300",
      textAlign: "center",
      color: Colors[colorScheme].text,
      marginBottom: 12,
      letterSpacing: -0.8,
      lineHeight: 48,
    },
    rewardTextAccent: {
      fontSize: 40,
      fontWeight: "800",
      textAlign: "center",
      color: Colors[colorScheme].tint,
      letterSpacing: -0.8,
      lineHeight: 48,
      marginBottom: 40,
    },
    featureList: {
      width: "100%",
      maxWidth: 300,
      marginTop: 32,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    featureIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].tint + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    checkIcon: {
      fontSize: 14,
      fontWeight: "700",
      color: Colors[colorScheme].tint,
    },
    featureText: {
      fontSize: 16,
      fontWeight: "500",
      color: Colors[colorScheme].text + "80",
      flex: 1,
    },
    buttonWrapper: {
      width: "100%",
      alignItems: "center",
    },
    recordButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 24,
      paddingHorizontal: 32,
      borderRadius: 24,
      width: "100%",
      alignItems: "center",
      shadowColor: Colors[colorScheme].tint,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      marginBottom: 32,
    },
    recordButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    recordButtonDisabled: {
      opacity: 0.8,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    recordButtonIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    recordButtonText: {
      fontSize: 20,
      fontWeight: "700",
      color: colorScheme === "dark" ? "#000000" : "#ffffff",
      letterSpacing: 0.5,
    },
    permissionHint: {
      fontSize: 13,
      color: colorScheme === "dark" ? "#000000" + "80" : "#ffffff" + "80",
      textAlign: "center",
      fontWeight: "500",
    },
    loadingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#ffffff",
      marginHorizontal: 2,
    },
    loadingDot2: {
      animationDelay: "0.2s",
    },
    loadingDot3: {
      animationDelay: "0.4s",
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