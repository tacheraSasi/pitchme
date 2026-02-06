import ScreenLayout from "@/components/ScreenLayout";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { ToolsList } from "@/components/tools/tools-list";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: Colors[colorScheme ?? "light"].borderColor }]}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </Pressable>
            <ThemedText style={styles.headerTitle}>Tools</ThemedText>
            <View style={styles.placeholder} />
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <View style={[styles.descriptionCard, { backgroundColor: Colors[colorScheme ?? "light"].tint + '10' }]}>
              <View style={[
                styles.descriptionIcon,
                { backgroundColor: Colors[colorScheme ?? "light"].tint + '20' }
              ]}>
                <MaterialIcons
                  name="build"
                  size={24}
                  color={Colors[colorScheme ?? "light"].tint}
                />
              </View>
              <View style={styles.descriptionText}>
                <ThemedText style={styles.descriptionTitle}>Musical Tools</ThemedText>
                <ThemedText style={styles.descriptionSubtitle}>
                  Explore tools to help you create and understand music
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Tools List */}
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors[colorScheme].text,
    },
    placeholder: {
      width: 32,
    },
    descriptionSection: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    descriptionCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 14,
      gap: 12,
    },
    descriptionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    descriptionText: {
      flex: 1,
    },
    descriptionTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 2,
    },
    descriptionSubtitle: {
      fontSize: 12,
      color: Colors[colorScheme].text,
      opacity: 0.7,
    },
  });
