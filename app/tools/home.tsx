import ScreenLayout from "@/components/ScreenLayout";
import TabsHeader from "@/components/tabs-header";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { ToolsList } from "@/components/tools/tools-list";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ToolsScreen() {
  const aboutBottomSheetRef = useRef<BottomSheet>(null);
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  return (
    <ScreenLayout
      styles={styles.container}
      aboutBottomSheetRef={aboutBottomSheetRef}
    >
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ToolsList />
        </SafeAreaView>
      </ThemedView>
    </ScreenLayout>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerSection: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 8,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(150, 89, 151, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors[colorScheme].text,
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
      lineHeight: 18,
    },
  });
