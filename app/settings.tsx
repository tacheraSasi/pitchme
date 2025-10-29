import { StatusBarPresets } from "@/components/themed/themed-status-bar";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useCycleRecordingQuality,
  useCycleTheme,
  useSetAutoPlay,
  useSetHapticFeedback,
  useSetNotifications,
  useSettingsStore,
} from "@/stores/settingsStore";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  const {
    notifications,
    hapticFeedback,
    autoPlay,
    recordingQuality,
    themeMode,
  } = useSettingsStore();

  const cycleTheme = useCycleTheme();
  const setAutoPlay = useSetAutoPlay();
  const cycleRecordingQuality = useCycleRecordingQuality();
  const setNotifications = useSetNotifications();
  const setHapticFeedback = useSetHapticFeedback();

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={icon as any}
            size={24}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </View>
        <View style={styles.settingContent}>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
          )}
        </View>
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <ThemedText style={styles.sectionHeader}>{title}</ThemedText>
  );

  return (
    <ThemedView style={styles.container}>
      {StatusBarPresets.modal()}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Interface" />

        <SettingItem
          icon="notifications"
          title="Push Notifications"
          subtitle="Get notified about new features"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              disabled
              trackColor={{
                false: "#767577",
                true: Colors[colorScheme ?? "light"].tint,
              }}
              thumbColor={notifications ? "#f4f3f4" : "#f4f3f4"}
            />
          }
        />

        <SettingItem
          icon="palette"
          title="Theme"
          subtitle={`Current: ${
            themeMode.charAt(0).toUpperCase() + themeMode.slice(1)
          }`}
          onPress={cycleTheme}
          rightElement={
            <View style={styles.themeIndicator}>
              <MaterialIcons
                name={
                  themeMode === "system"
                    ? "brightness-auto"
                    : themeMode === "light"
                    ? "brightness-high"
                    : "brightness-2"
                }
                size={20}
                color={Colors[colorScheme ?? "light"].text}
                opacity={0.7}
              />
              <Entypo
                name="chevron-right"
                size={20}
                color={Colors[colorScheme ?? "light"].text}
                opacity={0.5}
              />
            </View>
          }
        />

        <SettingItem
          icon="vibration"
          title="Haptic Feedback"
          subtitle="Feel vibrations when interacting"
          rightElement={
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              disabled
              trackColor={{
                false: "#767577",
                true: Colors[colorScheme ?? "light"].tint,
              }}
              thumbColor={hapticFeedback ? "#f4f3f4" : "#f4f3f4"}
            />
          }
        />
        <SectionHeader title="Audio Settings" />

        <SettingItem
          icon="volume-up"
          title="Auto-play Notes"
          subtitle="Automatically play notes when tapped"
          rightElement={
            <Switch
              value={autoPlay}
              onValueChange={setAutoPlay}
              disabled
              trackColor={{
                false: "#767577",
                true: Colors[colorScheme ?? "light"].tint,
              }}
              thumbColor={autoPlay ? "#f4f3f4" : "#f4f3f4"}
            />
          }
        />

        <SettingItem
          icon="high-quality"
          title="Recording Quality"
          subtitle={`Current: ${
            recordingQuality.charAt(0).toUpperCase() + recordingQuality.slice(1)
          }`}
          onPress={cycleRecordingQuality}
          rightElement={
            <Entypo
              name="chevron-right"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
              opacity={0.5}
            />
          }
        />

        <SectionHeader title="About" />

        <SettingItem
          icon="info"
          title="App Version"
          subtitle="1.0.0 (Build 1)"
          onPress={() => {}}
        />

        <SettingItem
          icon="help"
          title="Help & Support"
          subtitle="Get help with the app"
          onPress={() => {}}
          rightElement={
            <Entypo
              name="chevron-right"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
              opacity={0.5}
            />
          }
        />

        <SettingItem
          icon="privacy-tip"
          title="Privacy Policy"
          subtitle="Learn about your privacy"
          onPress={() => {}}
          rightElement={
            <Entypo
              name="chevron-right"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
              opacity={0.5}
            />
          }
        />

        <View style={styles.footer}>
          <Link href="/" dismissTo style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>
              ← Back to Home
            </ThemedText>
          </Link>

          <ThemedText style={styles.footerText}>
            Made with ♪ for music lovers
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 30,
      marginBottom: 15,
      color: Colors[colorScheme].text,
      opacity: 0.8,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginVertical: 2,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].text + "15",
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors[colorScheme].tint + "15",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    settingSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.6,
      marginTop: 2,
    },
    settingRight: {
      alignItems: "center",
      justifyContent: "center",
    },
    themeIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    backButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: Colors[colorScheme].tint + "15",
      borderRadius: 25,
      marginBottom: 20,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: Colors[colorScheme].tint,
    },
    footerText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.5,
      fontStyle: "italic",
    },
  });
