import AppIcon from "@/components/app-icon";
import SettingsIcon from "@/components/settings/icon";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface TabsHeaderProps {
  title: string;
  aboutBottomSheetRef: React.RefObject<BottomSheet | null>;
  showSearchButton?: boolean;
  onSearchPress?: () => void;
}
const TabsHeader = ({
  title,
  aboutBottomSheetRef,
  showSearchButton,
  onSearchPress,
}: TabsHeaderProps) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  const openAboutBottomSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    aboutBottomSheetRef.current?.expand();
  };

  return (
    <ThemedView style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <Pressable
          style={styles.iconWrapper}
          onPress={() => openAboutBottomSheet()}
        >
          <AppIcon backgroundColor={styles.iconWrapper.backgroundColor} />
        </Pressable>
        <View style={styles.titleSection}>
          <ThemedText type="title" style={styles.titleText}>
            {title}
          </ThemedText>
          <ThemedText style={styles.subtitleText}>
            Make sure you hit that note haha!
          </ThemedText>
        </View>
      </View>

      <View style={styles.rightSection}>
        {showSearchButton && onSearchPress && (
          <Pressable style={styles.searchButton} onPress={onSearchPress}>
            <Ionicons
              name="search"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
            />
          </Pressable>
        )}
        <Pressable
          style={styles.settingsButton}
          onPress={() => {
            router.push("/settings");
          }}
        >
          <SettingsIcon
            backgroundColor={styles.settingsButton.backgroundColor}
          />
        </Pressable>
      </View>
    </ThemedView>
  );
};
const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#333333" : "#f0f0f0",
      backgroundColor:
        colorScheme === "dark"
          ? Colors.dark.background
          : Colors.light.background,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#444444" : "#e0e0e0",
    },
    titleSection: {
      flex: 1,
    },
    rightSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    searchButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#444444" : "#e0e0e0",
      alignItems: "center",
      justifyContent: "center",
    },
    titleText: {
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: 0.5,
      color: Colors[colorScheme].text,
      marginBottom: 2,
    },
    subtitleText: {
      fontSize: 8.6667,
      color: Colors[colorScheme].text,
      opacity: 0.6,
      fontWeight: "500",
    },
    settingsButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#444444" : "#e0e0e0",
    },
  });

export default TabsHeader;
