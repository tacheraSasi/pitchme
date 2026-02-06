import { Tabs } from "expo-router";
import React from "react";

import { supportsGlassEffect } from "@/components/glass";
import { HapticTab } from "@/components/haptic-tab";
import TabBarIcon from "@/components/ui/tab-icon";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Entypo } from "@expo/vector-icons";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const brandColor = Colors[colorScheme ?? "light"].tint;

  // Use NativeTabs on iOS with glass effect support
  if (supportsGlassEffect) {
    return (
      <NativeTabs
        minimizeBehavior="onScrollDown"
        labelStyle={{
          color: DynamicColorIOS({
            dark: "white",
            light: "black",
          }),
        }}
        tintColor={brandColor}
      >
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf={{ default: "music.note.house", selected: "music.note.house.fill" }} />
        </NativeTabs.Trigger>

        {/* Studio/Record Tab */}
        <NativeTabs.Trigger name="record">
          <Label>Studio</Label>
          <Icon sf={{ default: "mic", selected: "mic.fill" }} />
        </NativeTabs.Trigger>

        {/* Songs Tab */}
        <NativeTabs.Trigger name="songs">
          <Label>Songs</Label>
          <Icon sf={{ default: "music.note.list", selected: "music.note.list" }} />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Fallback to regular Tabs for non-iOS devices
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderTopWidth: 0.2,
          borderTopColor: "rgba(33, 33, 33, 0.16)",
          paddingVertical: 20,
          height: 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="folder-music" color={color} focused={focused} IconComponent={Entypo} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: "Studio",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="mic" color={color} focused={focused} IconComponent={Entypo} />
          ),
        }}
      />
      <Tabs.Screen
        name="songs"
        options={{
          title: "Songs",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="music" color={color} focused={focused} IconComponent={Entypo} />
          ),
        }}
      />
    </Tabs>
  );
}