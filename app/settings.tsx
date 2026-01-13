import Avatar from "@/components/avatar";
import ScreenLayout from "@/components/ScreenLayout";
import { StatusBarPresets } from "@/components/themed/themed-status-bar";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { privacyPolicyUrl, supportUrl } from "@/constants/external-urls";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useCycleRecordingQuality,
  useCycleTheme,
  useSetHapticFeedback,
  useSetLoopNotes,
  useSetNotifications,
  useSettingsStore,
  useSetVoicePreset,
  useVoicePreset,
  VoicePreset,
} from "@/stores/settingsStore";
import { HapticFeedback } from "@/utils/haptics";
import { APP_VERSION } from "@/version/version";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Link, router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  const {
    notifications,
    hapticFeedback,
    loopNotes,
    recordingQuality,
    themeMode,
  } = useSettingsStore();

  const voicePreset = useVoicePreset();
  const setVoicePreset = useSetVoicePreset();
  const [isVoiceSheetOpen, setIsVoiceSheetOpen] = useState(false);
  const voiceSheetRef = useRef<BottomSheet>(null);
  const voiceSnapPoints = useMemo(() => ["30%", "55%"], []);

  const cycleTheme = useCycleTheme();
  const setLoopNotes = useSetLoopNotes();
  const cycleRecordingQuality = useCycleRecordingQuality();
  const setNotifications = useSetNotifications();
  const setHapticFeedback = useSetHapticFeedback();


  const confettiRef = useRef<ConfettiCannon | null>(null);

  const openVoiceSheet = useCallback(() => {
    voiceSheetRef.current?.snapToIndex(1);
  }, []);

  const closeVoiceSheet = useCallback(() => {
    voiceSheetRef.current?.close();
  }, []);

  const handleVoiceSheetChange = useCallback((index: number) => {
    setIsVoiceSheetOpen(index >= 0);
  }, []);

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

  const voicePresets: {
    value: VoicePreset;
    label: string;
    avatar: any;
  }[] = [
    {
      value: "tach",
      label: "Tach",
      avatar: require("../assets/images/avatars/tach.jpg"),
    },
    {
      value: "jonah",
      label: "Jonah",
      avatar: require("../assets/images/avatars/jonah.jpg"),
    },
    {
      value: "eliada",
      label: "Eliada",
      avatar: require("../assets/images/avatars/eliada.jpg"),
    },
  ];

  const getPresetLabel = (preset: VoicePreset) => {
    return voicePresets.find((p) => p.value === preset)?.label || preset;
  };

  return (
    <ScreenLayout styles={styles.container}>

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
          title="Loop Notes"
          subtitle="Loop notes when tapped"
          rightElement={
            <Switch
              value={loopNotes}
              onValueChange={setLoopNotes}
              trackColor={{
                false: "#767577",
                true: Colors[colorScheme ?? "light"].tint,
              }}
              thumbColor={loopNotes ? "#f4f3f4" : "#f4f3f4"}
            />
          }
        />

        <SettingItem
          icon="record-voice-over"
          title="Voice Preset"
          subtitle={`Current: ${getPresetLabel(voicePreset)}`}
          onPress={openVoiceSheet}
          rightElement={
            <View style={styles.themeIndicator}>
              <Avatar
                source={
                  voicePresets.find((p) => p.value === voicePreset)?.avatar
                }
                size={28}
              />
              <Entypo
                name={isVoiceSheetOpen ? "chevron-down" : "chevron-right"}
                size={20}
                color={Colors[colorScheme ?? "light"].text}
                opacity={0.5}
              />
            </View>
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
          subtitle={`Version ${APP_VERSION}`}
          onPress={() => {}}
        />

        <SettingItem
          icon="help"
          title="Help & Support"
          subtitle="Get help with the app"
          onPress={() => {
            HapticFeedback("success");
            Linking.openURL(supportUrl);
          }}
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
          onPress={() => {
            HapticFeedback("success");
            const encodedUrl = encodeURIComponent(privacyPolicyUrl)
            router.push(`webview/${encodedUrl}` as any);
          }}
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

          {/* <ThemedText style={styles.footerText}>
            Made with ♪ for music lovers
          </ThemedText> */}
        </View>
      </ScrollView>

      <BottomSheet
        ref={voiceSheetRef}
        index={-1}
        snapPoints={voiceSnapPoints}
        enablePanDownToClose={true}
        onChange={handleVoiceSheetChange}
        backdropComponent={BottomSheetBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.presetSheetContent}>
          <ThemedText style={styles.sheetTitle}>Choose Voice Preset</ThemedText>
          <ThemedText style={styles.sheetSubtitle}>
            Pick the voice that feels right for you.
          </ThemedText>

          <View style={styles.presetContainer}>
            {voicePresets.map((preset) => (
              <Pressable
                key={preset.value}
                style={[
                  styles.presetCard,
                  voicePreset === preset.value && styles.presetCardActive,
                ]}
                onPress={() => {
                  setVoicePreset(preset.value);

                  if (preset.value === "tach") {
                    confettiRef.current?.start();
                    HapticFeedback("success");
                  }
                  closeVoiceSheet();
                }}
              >
                <View style={styles.presetCardContent}>
                  <View style={styles.presetAvatarContainer}>
                    <Avatar source={preset.avatar} size={56} />
                  </View>
                  <View style={styles.presetCardText}>
                    <ThemedText
                      style={[
                        styles.presetCardTitle,
                        voicePreset === preset.value &&
                          styles.presetCardTitleActive,
                      ]}
                    >
                      {preset.label}
                    </ThemedText>
                    <ThemedText style={styles.presetCardSubtitle}>
                      {preset.value === "tach"
                        ? "Default voice"
                        : preset.value === "jonah"
                        ? "Alternative voice"
                        : "Alternative voice"}
                    </ThemedText>
                  </View>
                  {voicePreset === preset.value && (
                    <View style={styles.presetCheckmark}>
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={Colors[colorScheme ?? "light"].tint}
                      />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
      />
    </ThemedView>
    </ScreenLayout>
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
    presetBadge: {
      marginRight: 4,
    },
    bottomSheetBackground: {
      backgroundColor: Colors[colorScheme].background,
    },
    handleIndicator: {
      backgroundColor: colorScheme === "dark" ? "#444444" : "#cccccc",
    },
    presetSheetContent: {
      flex: 1,
      padding: 20,
      gap: 12,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: Colors[colorScheme].text,
    },
    sheetSubtitle: {
      fontSize: 14,
      opacity: 0.7,
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    presetContainer: {
      marginTop: 8,
      marginBottom: 8,
      gap: 10,
    },
    presetCard: {
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: Colors[colorScheme].text + "10",
      overflow: "hidden",
      marginHorizontal: 4,
    },
    presetCardActive: {
      borderColor: Colors[colorScheme].tint + "40",
      backgroundColor: Colors[colorScheme].tint + "08",
    },
    presetCardContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    presetAvatarContainer: {
      marginRight: 16,
    },
    presetCardText: {
      flex: 1,
    },
    presetCardTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    presetCardTitleActive: {
      color: Colors[colorScheme].tint,
    },
    presetCardSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      opacity: 0.6,
    },
    presetCheckmark: {
      marginLeft: 8,
    },
  });
