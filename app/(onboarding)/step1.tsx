import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Pressable, StyleSheet } from "react-native";

export default function Step1() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const bgPulse = useRef(new Animated.Value(0)).current;

  // Entry animations
  useEffect(() => {
    // Background pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulse, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(bgPulse, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Logo entry with spring effect
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Text entry with slight delay
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Button entry
    Animated.sequence([
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
          delay: 100,
        }),
      ]),
    ]).start();
  }, []);

  const handleNext = () => {
    haptics("light");
    
    // Button press animation
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
      // Exit animations before navigation
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textFade, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.push("./step2");
      });
    });
  };

  // Interpolate background color based on pulse animation
  const animatedBgColor = bgPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [
      Colors[colorScheme ?? "light"].background,
      colorScheme === 'dark' ? '#1a1a2e' : '#f8f9ff'
    ],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: animatedBgColor }]}>
      <ThemedView style={styles.content}>
        {/* Decorative elements */}
        <ThemedView style={styles.decorativeCircles}>
          <Animated.View style={[styles.circle1, {
            transform: [{ scale: bgPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1]
            })}]
          }]} />
          <Animated.View style={[styles.circle2, {
            transform: [{ scale: bgPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05]
            })}]
          }]} />
          <Animated.View style={[styles.circle3, {
            transform: [{ scale: bgPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.08]
            })}]
          }]} />
        </ThemedView>

        {/* Header with Logo */}
        <ThemedView style={styles.header}>
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              }
            ]}
          >
            <Image
              source={require("../../assets/images/icons/android/play_store_512.png")}
              style={styles.logo}
            />
            <ThemedView style={styles.logoGlow} />
          </Animated.View>
          
          <ThemedText style={styles.appName}>PitchMe</ThemedText>
          <ThemedText style={styles.tagline}>
            Master Your Musical Ear
          </ThemedText>
        </ThemedView>

        {/* Main Content */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: textFade,
              transform: [{ translateY: textSlide }],
            }
          ]}
        >
          <ThemedText style={styles.hookText}>
            Everyone can hear pitch.
          </ThemedText>
          <ThemedText style={styles.hookTextAccent}>
            Few can control it.
          </ThemedText>
          
          <ThemedView style={styles.divider} />
          
          <ThemedText style={styles.description}>
            Capture inspiration whenever it strikes. Record, detect pitch, and never lose a melody again.
          </ThemedText>

          <ThemedView style={styles.featureHighlights}>
            
          </ThemedView>
        </Animated.View>

        {/* Bottom Section */}
        <ThemedView style={styles.bottomSection}>
          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                opacity: buttonOpacity,
                transform: [{ scale: buttonScale }],
              }
            ]}
          >
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
          </Animated.View>

          <ThemedView style={styles.stepIndicatorContainer}>
            <ThemedView style={styles.stepIndicator}>
              <ThemedView style={styles.activeStep} />
              <ThemedView style={styles.inactiveStep} />
              <ThemedView style={styles.inactiveStep} />
            </ThemedView>
            <ThemedText style={styles.stepText}>
              Step 1 of 3
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Animated.View>
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
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 40,
      overflow: 'hidden',
    },
    decorativeCircles: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
    },
    circle1: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: Colors[colorScheme].tint + '08',
      top: -150,
      right: -150,
    },
    circle2: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: Colors[colorScheme].tint + '05',
      bottom: -80,
      left: -80,
    },
    circle3: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: Colors[colorScheme].tint + '03',
      top: '30%',
      left: -75,
    },
    header: {
      alignItems: "center",
      paddingTop: 40,
      marginBottom: 20,
    },
    logoContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 24,
      zIndex: 2,
    },
    logoGlow: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 28,
      backgroundColor: Colors[colorScheme].tint + '30',
      top: -10,
      left: -10,
      zIndex: 1,
    },
    appName: {
      fontSize: 36,
      fontWeight: "800",
      color: Colors[colorScheme].text,
      letterSpacing: -0.8,
      marginBottom: 4,
    },
    tagline: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].text + '70',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    textContainer: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      maxWidth: 400,
    },
    hookText: {
      fontSize: 40,
      fontWeight: "300",
      textAlign: "center",
      color: Colors[colorScheme].text,
      marginBottom: 8,
      letterSpacing: -1,
      lineHeight: 48,
    },
    hookTextAccent: {
      fontSize: 40,
      fontWeight: "800",
      textAlign: "center",
      color: Colors[colorScheme].tint,
      letterSpacing: -1,
      lineHeight: 48,
      marginBottom: 32,
    },
    divider: {
      width: 60,
      height: 3,
      backgroundColor: Colors[colorScheme].tint + '40',
      borderRadius: 2,
      marginBottom: 32,
    },
    description: {
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
      color: Colors[colorScheme].text + '80',
      lineHeight: 24,
      marginBottom: 32,
      maxWidth: 300,
    },
    featureHighlights: {
      width: '100%',
      maxWidth: 280,
      gap: 16,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme].tint + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 20,
    },
    featureText: {
      fontSize: 15,
      fontWeight: "500",
      color: Colors[colorScheme].text + '90',
      flex: 1,
    },
    bottomSection: {
      width: "100%",
      alignItems: "center",
      paddingTop: 20,
    },
    buttonContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 24,
    },
    nextButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 18,
      paddingHorizontal: 48,
      borderRadius: 16,
      width: "100%",
      alignItems: "center",
    },
    nextButtonPressed: {
      opacity: 0.7,
    },
    nextButtonText: {
      fontSize: 17,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000000" : "#ffffff",
    },
    stepIndicatorContainer: {
      alignItems: 'center',
      gap: 12,
    },
    stepIndicator: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    activeStep: {
      width: 28,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors[colorScheme].tint,
    },
    inactiveStep: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors[colorScheme].text + '20',
    },
    stepText: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].text + '40',
      letterSpacing: 0.5,
    },
  });