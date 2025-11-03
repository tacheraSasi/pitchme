import NoteDetector from "@/components/note-detector/detector";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Pressable, StyleSheet } from "react-native";

interface NoteDetectorBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

const NoteDetectorBottomSheet = ({
  bottomSheetRef,
}: NoteDetectorBottomSheetProps) => {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  const { width, height } = Dimensions.get("window");

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;

  // Enhanced snap points for better UX
  const snapPoints = useMemo(() => ["30%", "60%", "95%"], []);

  // Smooth entrance animations
  const triggerEntranceAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous icon rotation
    Animated.loop(
      Animated.timing(iconRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [headerOpacity, cardScale, iconRotation]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("handleSheetChanges", index);
      if (index >= 0) {
        triggerEntranceAnimations();
      }
    },
    [triggerEntranceAnimations]
  );

  const closeModal = useCallback(() => {
    // Exit animation before closing
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      bottomSheetRef.current?.close();
    });
  }, [headerOpacity, cardScale, bottomSheetRef]);

  // Icon rotation interpolation
  const rotateInterpolation = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    return () => {
      iconRotation.stopAnimation();
    };
  }, [iconRotation]);

  // renders
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      style={styles.bottomSheet}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Animated Header with Glassmorphism Effect */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <ThemedView style={styles.headerGlass}>
            {/* Hero Icon Section */}
            <ThemedView style={styles.heroSection}>
              <Animated.View
                style={[
                  styles.heroIconContainer,
                  { transform: [{ rotate: rotateInterpolation }] },
                ]}
              >
                <ThemedView style={styles.iconGlow}>
                  <Entypo name="sound" size={32} color="#FFFFFF" />
                </ThemedView>
              </Animated.View>

              <ThemedView style={styles.titleContainer}>
                <ThemedText style={styles.heroTitle}>Note Detector</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  🎵 Sing, hum & discover your musical note
                </ThemedText>

                {/* Feature Pills */}
                <ThemedView style={styles.featurePills}>
                  <ThemedView style={styles.pill}>
                    <Entypo
                      name="music"
                      size={14}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.pillText}>Real-time</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.pill}>
                    <Entypo
                      name="tools"
                      size={14}
                      color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.pillText}>AI-powered</ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Close Button with Hover Effect */}
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <ThemedView style={styles.closeButtonInner}>
                <Entypo
                  name="cross"
                  size={20}
                  color={Colors[colorScheme ?? "light"].text}
                />
              </ThemedView>
            </Pressable>
          </ThemedView>
        </Animated.View>

        {/* Detector Container with Premium Styling */}
        <Animated.View
          style={[
            styles.detectorContainer,
            { transform: [{ scale: cardScale }] },
          ]}
        >
          <ThemedView style={styles.detectorWrapper}>
            <NoteDetector />
          </ThemedView>
        </Animated.View>

        {/* Bottom Tips Section */}
        <ThemedView style={styles.tipsSection}>
          <ThemedView style={styles.tipItem}>
            <Entypo
              name="info"
              size={16}
              color={Colors[colorScheme ?? "light"].tint}
            />
            <ThemedText style={styles.tipText}>
              Hold your device close and sing clearly for best results
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    // Enhanced Bottom Sheet Styling
    bottomSheet: {
      shadowColor: colorScheme === "dark" ? "#000" : "#000",
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
    },
    bottomSheetBackground: {
      backgroundColor: Colors[colorScheme].background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    handleIndicator: {
      backgroundColor: colorScheme === "dark" ? "#555555" : "#d0d0d0",
      width: 50,
      height: 5,
      borderRadius: 3,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 34,
    },

    // Hero Header Section
    header: {
      marginBottom: 28,
      borderRadius: 24,
      overflow: "hidden",
    },
    headerGlass: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.02)",
      backdropFilter: "blur(20px)",
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
      padding: 20,
      position: "relative",
    },
    heroSection: {
      alignItems: "center",
      marginBottom: 4,
    },
    heroIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 16,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    iconGlow: {
      width: "100%",
      height: "100%",
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colorScheme === "dark"
          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      shadowColor: Colors[colorScheme].tint,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 12,
    },

    // Typography
    titleContainer: {
      alignItems: "center",
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 32,
      fontWeight: "900",
      color: Colors[colorScheme].text,
      marginBottom: 6,
      textAlign: "center",
      letterSpacing: -1,
    },
    heroSubtitle: {
      fontSize: 17,
      color: Colors[colorScheme].text,
      opacity: 0.75,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 24,
    },

    // Feature Pills
    featurePills: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors[colorScheme].tint + "30",
    },
    pillText: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      opacity: 0.8,
    },

    // Close Button
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
    },
    closeButtonInner: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.05)",
    },

    // Detector Container
    detectorContainer: {
      marginBottom: 24,
      borderRadius: 20,
      overflow: "hidden",
    },
    detectorWrapper: {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.03)"
          : "rgba(0, 0, 0, 0.02)",
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.06)",
      shadowColor: colorScheme === "dark" ? "#000" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },

    // Tips Section
    tipsSection: {
      marginTop: "auto",
      paddingTop: 16,
    },
    tipItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.03)",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.05)",
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.8,
      lineHeight: 20,
      fontWeight: "500",
    },
  });

export default NoteDetectorBottomSheet;
