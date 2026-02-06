import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import TabBarIcon from "@/components/ui/tab-icon";
import { Entypo } from "@expo/vector-icons";
import { supportsGlassEffect } from "@/components/glass";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const brandColor = Colors[colorScheme ?? "light"].tint;

  // Use NativeTabs on iOS 26+, fallback to regular Tabs on other platforms
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
        {/* Home Tab */}
        <NativeTabs.Trigger name="home">
          <Label>Home</Label>
          <Icon sf={{ default: "house", selected: "house.fill" }} />
        </NativeTabs.Trigger>

        {/* Profile / Account Tab */}
        <NativeTabs.Trigger name="profile">
          <Label>Account</Label>
          <Icon sf={{ default: "person", selected: "person.fill" }} />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Fallback to regular Tabs for non-iOS 26 devices

  return (
    <>
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
              <TabBarIcon name="folder-music" color={color} focused={focused} IconComponent={Entypo}/>
            ),
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: "Studio",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="mic" color={color} focused={focused} IconComponent={Entypo}/>
            ),
          }}
        />
        <Tabs.Screen
          name="songs"
          options={{
            title: "Songs",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="music" color={color} focused={focused} IconComponent={Entypo}/>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
